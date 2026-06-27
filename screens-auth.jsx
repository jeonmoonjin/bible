// 가입/로그인 화면 (Firebase 연결 버전)
const { useState: useStateA, useEffect: useEffectA } = React;

function AuthScreen({ group, members, onLogin, onSignup }) {
  const [mode, setMode] = useStateA('select'); // select | login | signup
  const [signupStage, setSignupStage] = useStateA('name'); // name | pin
  const [selectedMember, setSelectedMember] = useStateA(null);
  const [pin, setPin] = useStateA('');
  const [pinConfirm, setPinConfirm] = useStateA('');
  const [pinStage, setPinStage] = useStateA('enter'); // enter | confirm
  const [signupName, setSignupName] = useStateA('');
  const [signupNameDraft, setSignupNameDraft] = useStateA('');
  const [error, setError] = useStateA('');
  const [loading, setLoading] = useStateA(false);

  const reset = () => {
    setMode('select'); setSelectedMember(null);
    setPin(''); setPinConfirm(''); setPinStage('enter');
    setSignupName(''); setSignupNameDraft(''); setSignupStage('name');
    setError('');
  };

  const confirmName = () => {
    const name = signupNameDraft.trim();
    if (!name) {
      setError('이름을 입력해주세요'); return;
    }
    if (name.length < 2) {
      setError('이름은 2자 이상 입력해주세요'); return;
    }
    if (members.some(m => m.name === name)) {
      setError('이미 같은 이름이 있습니다'); return;
    }
    setSignupName(name);
    setSignupStage('pin');
    setError('');
  };

  const submitLogin = async () => {
    if (!selectedMember || pin.length !== 4) return;
    setLoading(true); setError('');
    try {
      const ok = await onLogin(selectedMember, pin);
      if (!ok) {
        setError('PIN이 맞지 않습니다');
        setPin('');
      }
    } catch (e) {
      setError('로그인 중 오류가 발생했습니다');
    }
    setLoading(false);
  };

  const submitSignup = async () => {
    if (pin.length !== 4) {
      setError('4자리 PIN을 입력해주세요'); return;
    }
    if (pin !== pinConfirm) {
      setError('PIN이 일치하지 않습니다. 다시 입력해주세요.');
      setPinConfirm(''); setPinStage('confirm');
      return;
    }
    setLoading(true); setError('');
    try {
      await onSignup(signupName, pin);
    } catch (e) {
      setError('가입 중 오류가 발생했습니다: ' + e.message);
    }
    setLoading(false);
  };

  // ============ 화면 분기 ============

  // 0) 가입 화면 - 이름 입력 단계
  if (mode === 'signup' && signupStage === 'name') {
    return (
      <div style={authWrap}>
        <BackBtn onClick={reset} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌿</div>
          <div style={authTitle}>다락방에 새로 합류해요</div>
          <div style={authSub}>먼저 본인의 이름을 알려주세요</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, color: 'var(--textMute)', fontWeight: 600,
            marginBottom: 6, letterSpacing: '0.04em',
          }}>이름</div>
          <input
            autoFocus
            placeholder="예: 김은혜"
            value={signupNameDraft}
            onChange={e => { setSignupNameDraft(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') confirmName(); }}
            style={authInput}
          />
        </div>

        {error && <div style={errStyle}>{error}</div>}

        <button
          onClick={confirmName}
          disabled={!signupNameDraft.trim()}
          style={{
            ...primaryBtnA, width: '100%', marginTop: 8,
            opacity: signupNameDraft.trim() ? 1 : 0.4,
          }}>
          다음 — PIN 설정하기
        </button>

        <div style={{
          marginTop: 20, padding: '10px 14px', background: 'var(--surfaceAlt)',
          borderRadius: 'var(--radiusSm)', fontSize: 11, color: 'var(--textMute)',
          textAlign: 'center', lineHeight: 1.55,
        }}>
          💡 같은 다락방 멤버들이 알아볼 수 있는 이름으로 적어주세요.<br/>
          다음 단계에서 4자리 PIN을 정합니다.
        </div>
      </div>
    );
  }

  // 0-2) 가입 화면 - PIN 입력 단계
  if (mode === 'signup' && signupStage === 'pin') {
    const currentPin = pinStage === 'enter' ? pin : pinConfirm;
    const setCurrentPin = pinStage === 'enter' ? setPin : setPinConfirm;
    return (
      <div style={authWrap}>
        <BackBtn onClick={() => {
          // PIN 단계에서 뒤로 가면 이름 단계로
          if (pinStage === 'confirm') {
            setPinStage('enter'); setPinConfirm(''); setError('');
          } else {
            setSignupStage('name'); setPin(''); setError('');
          }
        }} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <div style={authTitle}>
            {pinStage === 'enter' ? `${signupName}님, PIN 설정` : '한번 더 입력해주세요'}
          </div>
          <div style={authSub}>
            {pinStage === 'enter'
              ? '본인만 아는 4자리 숫자를 입력해주세요'
              : '확인을 위해 같은 PIN을 한번 더 입력해주세요'}
          </div>
        </div>

        <PinDots pin={currentPin} />
        {error && <div style={errStyle}>{error}</div>}
        <Keypad
          onDigit={d => { setCurrentPin(p => (p + d).slice(0, 4)); setError(''); }}
          onDelete={() => setCurrentPin(p => p.slice(0, -1))}
        />
        <button
          onClick={() => {
            if (currentPin.length !== 4) return;
            if (pinStage === 'enter') { setPinStage('confirm'); setError(''); }
            else { submitSignup(); }
          }}
          disabled={currentPin.length !== 4 || loading}
          style={{
            ...primaryBtnA, width: '100%', marginTop: 18,
            opacity: currentPin.length === 4 ? 1 : 0.4,
          }}>
          {loading ? '등록 중...' : (pinStage === 'enter' ? '다음' : '가입 완료')}
        </button>
      </div>
    );
  }

  // 1) 로그인 화면 (멤버 선택 후 PIN 입력)
  if (mode === 'login' && selectedMember) {
    return (
      <div style={authWrap}>
        <BackBtn onClick={reset} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar name={selectedMember.name} color={selectedMember.color} size={72} />
          <div style={{ ...authTitle, marginTop: 14 }}>
            안녕하세요, {selectedMember.name}님
          </div>
          <div style={authSub}>
            4자리 PIN을 입력해주세요
          </div>
        </div>
        <PinDots pin={pin} />
        {error && <div style={errStyle}>{error}</div>}
        <Keypad
          onDigit={d => { setPin(p => (p + d).slice(0, 4)); setError(''); }}
          onDelete={() => setPin(p => p.slice(0, -1))}
        />
        <button onClick={submitLogin} disabled={pin.length !== 4 || loading} style={{
          ...primaryBtnA, width: '100%', marginTop: 18,
          opacity: pin.length === 4 ? 1 : 0.4,
        }}>
          {loading ? '확인 중...' : '입장하기'}
        </button>
      </div>
    );
  }

  // 2) 멤버 선택 화면 (메인 진입)
  return (
    <div style={authWrap}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
        <div style={{
          fontSize: 12, color: 'var(--accent)', fontWeight: 700,
          letterSpacing: '0.1em', marginBottom: 6,
        }}>
          교회 다락방 · 성경 통독
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--fontHeading)',
        }}>
          {group.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--textSub)', marginTop: 8 }}>
          {fmtDate(group.startDate)} ~ {fmtDate(group.endDate)}
        </div>
      </div>

      {members.length === 0 ? (
        <div style={{
          padding: 20, background: 'var(--surfaceAlt)',
          borderRadius: 'var(--radius)', textAlign: 'center',
          color: 'var(--textSub)', fontSize: 13, marginBottom: 16,
        }}>
          아직 다락방에 멤버가 없어요.<br/>
          첫 번째로 합류해보세요 🌿
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--textSub)', marginBottom: 10, textAlign: 'center' }}>
            본인의 이름을 선택해주세요
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {members.map(m => (
              <button key={m.id}
                onClick={() => { setSelectedMember(m); setMode('login'); setPin(''); setError(''); }}
                style={memberBtn}>
                <Avatar name={m.name} color={m.color} size={36} />
                <span style={memberBtnName}>{m.name}</span>
                <span style={{ color: 'var(--textMute)' }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}

      <button onClick={() => { setMode('signup'); setError(''); }} style={{
        width: '100%', padding: 14,
        background: members.length === 0 ? 'var(--accent)' : 'transparent',
        color: members.length === 0 ? '#fff' : 'var(--accent)',
        border: members.length === 0 ? 'none' : '1.5px dashed var(--accent)',
        borderRadius: 'var(--radius)',
        fontWeight: 600, fontSize: 14, cursor: 'pointer',
        fontFamily: 'var(--fontBody)',
      }}>
        + 다락방에 새로 합류하기
      </button>

      <div style={{
        marginTop: 24, padding: '10px 14px', background: 'var(--surfaceAlt)',
        borderRadius: 'var(--radiusSm)', fontSize: 11, color: 'var(--textMute)',
        textAlign: 'center',
      }}>
        💡 PIN은 본인이 정한 4자리 숫자입니다. 잊으셨다면 다락방장에게 문의해주세요.
      </div>
    </div>
  );
}

// ============ 공용 컴포넌트 ============
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', color: 'var(--textSub)',
      fontSize: 14, marginBottom: 20, cursor: 'pointer', padding: 0,
    }}>← 이전으로</button>
  );
}

function PinDots({ pin }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          width: 48, height: 56, borderRadius: 'var(--radiusSm)',
          background: 'var(--surface)',
          border: pin.length === i ? '2px solid var(--accent)' : '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--fontHeading)',
        }}>
          {pin[i] ? '●' : ''}
        </div>
      ))}
    </div>
  );
}

function Keypad({ onDigit, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button key={n} onClick={() => onDigit(n)} style={keyStyleA}>{n}</button>
      ))}
      <div />
      <button onClick={() => onDigit(0)} style={keyStyleA}>0</button>
      <button onClick={onDelete} style={{ ...keyStyleA, background: 'transparent', fontSize: 18 }}>⌫</button>
    </div>
  );
}

// ============ 스타일 ============
const authWrap = { padding: 24, paddingTop: 40, minHeight: '100vh' };
const authTitle = {
  fontSize: 22, fontWeight: 700, color: 'var(--text)',
  fontFamily: 'var(--fontHeading)', lineHeight: 1.3, marginTop: 8,
};
const authSub = { fontSize: 13, color: 'var(--textSub)', marginTop: 6 };
const authInput = {
  width: '100%', padding: '14px 16px', fontSize: 16,
  background: 'var(--surface)', border: '1.5px solid var(--border)',
  borderRadius: 'var(--radiusSm)', color: 'var(--text)',
  fontFamily: 'var(--fontBody)', outline: 'none',
};
const memberBtn = {
  display: 'flex', alignItems: 'center', gap: 12, padding: 14,
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
  width: '100%',
};
const memberBtnName = {
  flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text)',
  fontFamily: 'var(--fontHeading)',
};
const primaryBtnA = {
  padding: '14px 16px', background: 'var(--accent)',
  color: '#fff', border: 'none', borderRadius: 'var(--radiusSm)',
  fontWeight: 700, fontSize: 14, cursor: 'pointer',
  fontFamily: 'var(--fontBody)',
};
const keyStyleA = {
  height: 56, fontSize: 22, fontWeight: 600,
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radiusSm)', color: 'var(--text)',
  cursor: 'pointer', fontFamily: 'var(--fontHeading)',
};
const errStyle = {
  textAlign: 'center', color: '#C95252', fontSize: 12,
  marginBottom: 12, fontWeight: 600,
};

window.AuthScreen = AuthScreen;
