// Firebase 연결 메인 앱
const { useState: useStateF, useEffect: useEffectF, useMemo: useMemoF } = React;

const SESSION_KEY = 'darakbang_session_v1';

function loadSavedSession() {
  try {
    // 기존 sessionStorage 사용자도 한 번은 살려주기 위한 호환 처리
    const saved =
      localStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(SESSION_KEY);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function BibleAppFirebase() {
  const [group, setGroup] = useStateF(null);
  const [members, setMembers] = useStateF([]);
  const [progressMap, setProgressMap] = useStateF({});
  const [cheers, setCheers] = useStateF([]);

  const [currentMemberId, setCurrentMemberId] = useStateF(() => {
    return loadSavedSession()?.id || null;
  });

  const [membersLoaded, setMembersLoaded] = useStateF(false);
  const [screen, setScreen] = useStateF('home');
  const [ready, setReady] = useStateF(false);
  const [fbReady, setFbReady] = useStateF(false);

  // Tweaks
  const t = window.useTweaks({ theme: 'warm' });
  useEffectF(() => { window.applyTheme(t.theme); }, [t.theme]);

  // Firebase 준비 대기
  useEffectF(() => {
    if (window.FB) { setFbReady(true); return; }
    const handler = () => setFbReady(true);
    window.addEventListener('firebase-ready', handler);
    return () => window.removeEventListener('firebase-ready', handler);
  }, []);

  // Firebase 익명 로그인 + 그룹 초기 데이터 보장 + 실시간 구독
  useEffectF(() => {
    if (!fbReady) return;
    const FB = window.FB;
    let unsubs = [];

    (async () => {
      await FB.authReady;

      // 1) 그룹 문서가 없으면 생성 (기본 정보 시드)
      const gSnap = await FB.getDoc(FB.groupRef());
      if (!gSnap.exists()) {
        await FB.setDoc(FB.groupRef(), {
          name: '탄방5다락방',
          startDate: '2026-05-01',
          endDate: '2026-10-31',
          scope: 'all',
          createdAt: FB.serverTimestamp(),
        });
      }

      // 2) 실시간 구독
      unsubs.push(FB.onSnapshot(FB.groupRef(), (snap) => {
        if (snap.exists()) setGroup({ id: snap.id, ...snap.data() });
      }));

      unsubs.push(FB.onSnapshot(FB.membersRef(), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0));
        setMembers(list);
        setMembersLoaded(true);
      }));
      unsubs.push(FB.onSnapshot(FB.progressRef(), (snap) => {
        const map = {};
        snap.docs.forEach(d => {
          map[d.id] = d.data().chapters || {};
        });
        setProgressMap(map);
      }));

      unsubs.push(FB.onSnapshot(
        FB.query(FB.cheersRef(), FB.orderBy('at', 'desc'), FB.limit(100)),
        (snap) => {
          setCheers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      ));

      setReady(true);
    })().catch(err => {
      console.error('Firebase 초기화 실패:', err);
      alert('Firebase 연결에 실패했어요. 콘솔에서 Firestore 보안 규칙을 확인해주세요.\n\n' + err.message);
    });

    return () => unsubs.forEach(u => u && u());
  }, [fbReady]);

  // ============ 액션 ============
  const FB = window.FB;

  const handleSignup = async (name, pin) => {
    const colors = ['#C9876A', '#A89372', '#8B9D77', '#B8855A', '#D4A574', '#9C7B5B', '#C19A6B', '#A67F5D', '#7A9460', '#D88B4A'];
    const pinHash = await FB.hashPin(pin);
    const newId = 'm' + Date.now().toString(36);
    await FB.setDoc(FB.memberRef(newId), {
      name, color: colors[members.length % colors.length],
      pinHash, joinedAt: FB.serverTimestamp(),
    });
    // 빈 진도 문서 초기화
    await FB.setDoc(FB.progressDocRef(newId), { chapters: {} });
    saveSession({ id: newId, name });
    setCurrentMemberId(newId);
  };

  const handleLogin = async (member, pin) => {
    const pinHash = await FB.hashPin(pin);
    const snap = await FB.getDoc(FB.memberRef(member.id));
    if (snap.exists() && snap.data().pinHash === pinHash) {
      saveSession({ id: member.id, name: member.name });
      setCurrentMemberId(member.id);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    clearSession();
    setCurrentMemberId(null);
    setScreen('home');
  };

  const handleToggle = async (bookId, ch) => {
    const key = `chapters.${bookId}-${ch}`;
    const isChecked = !!(progressMap[currentMemberId]?.[`${bookId}-${ch}`]);
    try {
      if (isChecked) {
        await FB.updateDoc(FB.progressDocRef(currentMemberId), { [key]: FB.deleteField() });
      } else {
        await FB.updateDoc(FB.progressDocRef(currentMemberId), { [key]: FB.serverTimestamp() });
      }
    } catch (e) {
      // 문서가 없으면 setDoc으로 생성
      await FB.setDoc(FB.progressDocRef(currentMemberId), {
        chapters: { ...(progressMap[currentMemberId] || {}), [`${bookId}-${ch}`]: Date.now() },
      }, { merge: true });
    }
  };

  const handleBulkSet = async (updates, isUnset = false) => {
    const newChapters = { ...(progressMap[currentMemberId] || {}) };
    for (const [k, v] of Object.entries(updates)) {
      if (isUnset || v === false) delete newChapters[k];
      else newChapters[k] = typeof v === 'number' ? v : Date.now();
    }
    await FB.setDoc(FB.progressDocRef(currentMemberId), { chapters: newChapters }, { merge: false });
  };

  const handleCheer = async (toId, emoji) => {
    await FB.addDoc(FB.cheersRef(), {
      from: currentMemberId, to: toId, emoji, at: FB.serverTimestamp(),
    });
  };

  const handleUpdateGroup = async (newGroup) => {
    const { id, ...data } = newGroup;
    await FB.updateDoc(FB.groupRef(), data);
  };

  const handleAddMember = () => {
    alert('새 멤버는 로그인 화면에서 "다락방에 새로 합류하기"로 직접 가입해야 해요.');
  };

  const handleResetAll = async () => {
    const confirm1 = confirm('정말 모든 멤버와 기록을 초기화할까요?\n\n되돌릴 수 없습니다.');
    if (!confirm1) return;
    const code = prompt('확인을 위해 다락방 이름을 그대로 입력해주세요:');
    if (code !== group.name) {
      alert('이름이 일치하지 않아 취소되었습니다.');
      return;
    }
    try {
      // 모든 서브컬렉션 삭제
      const batch = FB.writeBatch(FB.db);
      const [memSnap, progSnap, cheerSnap] = await Promise.all([
        FB.getDocs(FB.membersRef()),
        FB.getDocs(FB.progressRef()),
        FB.getDocs(FB.cheersRef()),
      ]);
      memSnap.docs.forEach(d => batch.delete(d.ref));
      progSnap.docs.forEach(d => batch.delete(d.ref));
      cheerSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      clearSession();
      setCurrentMemberId(null);
      alert('초기화 완료');
    } catch (e) {
      alert('초기화 실패: ' + e.message);
    }
  };

  const handleShareKakao = () => {
    const url = location.origin + location.pathname + '?g=' + FB.GROUP_ID;
    const text = `📖 ${group.name}\n성경 통독에 함께해요!\n\n${url}`;
    if (navigator.share) {
      navigator.share({ title: group.name, text, url });
    } else {
      navigator.clipboard?.writeText(text);
      alert('공유 링크가 복사되었습니다!\n\n' + url);
    }
  };

  // ============ 렌더 ============

  if (!fbReady || !ready || !group || !membersLoaded) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: 'var(--textSub)',
      }}>
        <div style={{ fontSize: 28 }}>📖</div>
        <div style={{ fontSize: 13 }}>다락방에 연결 중...</div>
      </div>
    );
  }

  const currentMember = members.find(m => m.id === currentMemberId);

  // 로그아웃 상태 → 인증 화면
  if (!currentMember) {
    return (
      <>
        <window.AuthScreen group={group} members={members}
          onLogin={handleLogin} onSignup={handleSignup} />
        <TweakPanelF t={t} screen={screen} setScreen={setScreen}
          currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId}
          members={members} onLogout={handleLogout} />
      </>
    );
  }

  // 인증 완료 → 메인 화면들
  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          group={group} members={members} progressMap={progressMap}
          cheers={cheers} currentMemberId={currentMemberId}
          onSelectMember={setCurrentMemberId}
          onCheer={handleCheer} onNavigate={setScreen}
        />
      )}
      {screen === 'read' && (
        <ReadScreen
          group={group} member={currentMember}
          memberProgress={progressMap[currentMemberId] || {}}
          onToggle={handleToggle} onBulkSet={handleBulkSet}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'stats' && (
        <StatsScreen
          group={group} members={members} progressMap={progressMap}
          cheers={cheers} onBack={() => setScreen('home')}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          group={group} currentMember={currentMember} members={members}
          onBack={() => setScreen('home')}
          onUpdateGroup={handleUpdateGroup}
          onAddMember={handleAddMember}
          onResetAll={handleResetAll}
          onShare={handleShareKakao}
          onSwitchUser={(id) => { /* 로그인 상태에서는 전환 안 함 - 로그아웃 후 재로그인 */
            if (id !== currentMemberId) {
              if (confirm('다른 사람으로 로그인하려면 먼저 로그아웃해야 합니다. 진행할까요?')) {
                handleLogout();
              }
            }
          }}
          onLogout={handleLogout}
        />
      )}

      <TweakPanelF t={t} screen={screen} setScreen={setScreen}
        currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId}
        members={members} onLogout={handleLogout} />
    </>
  );
}

function TweakPanelF({ t, screen, setScreen, currentMemberId, members, onLogout }) {
  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection title="디자인 시안">
        <window.TweakRadio tweak="theme" label=""
          options={[
            { value: 'warm', label: '베이지' },
            { value: 'scripture', label: '딥우드' },
            { value: 'cream', label: '코랄' },
          ]} />
        <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
          {window.THEMES[t.theme]?.subtitle}
        </div>
      </window.TweakSection>

      {currentMemberId && (
        <window.TweakSection title="화면 이동">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button onClick={() => setScreen('home')} style={tweakNavBtnF(screen === 'home')}>홈</button>
            <button onClick={() => setScreen('read')} style={tweakNavBtnF(screen === 'read')}>읽기</button>
            <button onClick={() => setScreen('stats')} style={tweakNavBtnF(screen === 'stats')}>통계</button>
            <button onClick={() => setScreen('settings')} style={tweakNavBtnF(screen === 'settings')}>설정</button>
            <button onClick={onLogout} style={{
              ...tweakNavBtnF(false), gridColumn: '1 / 3', background: '#f5f0e8', color: '#666',
            }}>로그아웃</button>
          </div>
        </window.TweakSection>
      )}

      <window.TweakSection title="Firebase 상태">
        <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
          <div>그룹: <code style={{ color: '#B8855A' }}>{window.FB?.GROUP_ID}</code></div>
          <div>멤버: {members.length}명 가입</div>
          <div>로그인: {currentMemberId ? '✓' : '—'}</div>
        </div>
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

function tweakNavBtnF(active) {
  return {
    padding: '8px 10px', fontSize: 12, fontWeight: 600,
    background: active ? '#B8855A' : '#FAF4E8',
    color: active ? '#fff' : '#6F5F4C',
    border: '1px solid ' + (active ? '#B8855A' : '#E6DBC4'),
    borderRadius: 8, cursor: 'pointer',
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(<BibleAppFirebase />);
