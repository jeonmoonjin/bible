// 다락방 성경 통독 앱 - 화면 컴포넌트들
const { useState, useEffect, useMemo, useRef } = React;

// =============== 공용 유틸 ===============
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
}

function fmtDateShort(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

// =============== 진도 링 / 진도 바 ===============
function ProgressBar({ percent, height = 8, color, track }) {
  return (
    <div style={{
      height, background: track || 'var(--progressTrack)',
      borderRadius: 999, overflow: 'hidden', width: '100%',
    }}>
      <div style={{
        height: '100%', width: `${Math.min(100, percent)}%`,
        background: color || 'var(--progressFill)',
        borderRadius: 999, transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

function ProgressRing({ percent, size = 56, stroke = 5, color, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, percent) / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--progressTrack)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color || 'var(--progressFill)'} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.24, fontWeight: 700, color: 'var(--text)',
        fontFamily: 'var(--fontHeading)',
      }}>
        {label !== undefined ? label : `${Math.round(percent)}%`}
      </div>
    </div>
  );
}

// =============== 멤버 아바타 ===============
function Avatar({ name, color, size = 36, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color || '#B8855A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 600, fontSize: size * 0.4,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 4px ${color}` : 'none',
      fontFamily: 'var(--fontBody)',
    }}>
      {name?.[0] || '?'}
    </div>
  );
}

// =============== 홈 (리더보드) ===============
function HomeScreen({ group, members, progressMap, cheers, currentMemberId, onSelectMember, onCheer, onNavigate }) {
  const [cheerTarget, setCheerTarget] = useState(null);

  // 멤버별 진도 계산 + 정렬
  const ranked = useMemo(() => {
    return members.map(m => {
      const prog = window.calcProgress(progressMap[m.id] || {}, group.scope);
      const daily = window.calcDailyTarget(progressMap[m.id] || {}, group);
      const weekly = window.calcWeeklyReads(progressMap[m.id] || {});
      return { ...m, ...prog, ...daily, weekly };
    }).sort((a, b) => b.percent - a.percent);
  }, [members, progressMap, group]);

  const me = ranked.find(m => m.id === currentMemberId);
  const expectedPct = window.getExpectedProgress(group) * 100;
  const totalDays = daysBetween(group.startDate, group.endDate);
  const elapsedDays = Math.max(0, daysBetween(group.startDate, new Date()));
  const daysLeft = Math.max(0, daysBetween(new Date(), group.endDate));

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* 헤더: 다락방 이름 + 기간 */}
      <div style={{
        padding: '20px 20px 16px', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--textMute)', marginBottom: 4, letterSpacing: '0.04em' }}>
              교회 다락방 · 성경 통독
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: 'var(--text)',
              fontFamily: 'var(--fontHeading)',
            }}>
              {group.name}
            </div>
          </div>
          <button onClick={() => onNavigate('settings')} style={iconBtn}>
            <SettingsIcon />
          </button>
        </div>

        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          marginTop: 10, fontSize: 12, color: 'var(--textSub)',
        }}>
          <span>{fmtDate(group.startDate)} → {fmtDate(group.endDate)}</span>
          <span style={{ color: 'var(--textMute)' }}>·</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {daysLeft > 0 ? `${daysLeft}일 남음` : '기간 종료'}
          </span>
        </div>
      </div>

      {/* 내 현황 카드 */}
      {me && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            background: 'var(--accentSoft)',
            borderRadius: 'var(--radius)',
            padding: 18,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={me.name} color={me.color} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--accentDeep)', fontWeight: 600 }}>
                  나의 진도
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--fontHeading)' }}>
                  {me.name}
                </div>
              </div>
              <ProgressRing percent={me.percent} size={64} stroke={6} color="var(--accentDeep)" />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <StatBlock label="읽은 장" value={me.read} suffix={`/ ${me.total}`} />
              <StatBlock label="하루 권장" value={me.perDay} suffix="장" highlight />
              <StatBlock label="이번 주" value={me.weekly} suffix="장" />
            </div>

            <button onClick={() => onNavigate('read')} style={{
              ...primaryBtn, width: '100%',
            }}>
              <span>오늘 읽은 장 체크하기</span>
              <ArrowIcon />
            </button>
          </div>
        </div>
      )}

      {/* 다락방 리더보드 */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'var(--fontHeading)',
          }}>
            다락방 진도
          </div>
          <button onClick={() => onNavigate('stats')} style={{
            fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none',
            cursor: 'pointer', fontWeight: 600,
          }}>
            통계 보기 →
          </button>
        </div>

        {/* 예상 진도 안내 */}
        <div style={{
          padding: '10px 12px', background: 'var(--surfaceAlt)',
          borderRadius: 'var(--radiusSm)', fontSize: 12, color: 'var(--textSub)',
          marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <span>오늘 기준 예상 진도는 <b style={{ color: 'var(--accentDeep)' }}>{Math.round(expectedPct)}%</b> 입니다</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranked.map((m, idx) => (
            <MemberCard
              key={m.id}
              member={m}
              rank={idx + 1}
              expectedPct={expectedPct}
              cheers={cheers.filter(c => c.to === m.id)}
              isMe={m.id === currentMemberId}
              onCheer={() => setCheerTarget(m)}
            />
          ))}
        </div>
      </div>

      {cheerTarget && (
        <CheerSheet
          target={cheerTarget}
          onClose={() => setCheerTarget(null)}
          onSend={(emoji) => { onCheer(cheerTarget.id, emoji); setCheerTarget(null); }}
        />
      )}
    </div>
  );
}

function StatBlock({ label, value, suffix, highlight }) {
  return (
    <div style={{
      flex: 1, padding: '10px 8px', background: highlight ? 'var(--accent)' : 'var(--surface)',
      borderRadius: 'var(--radiusSm)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <div style={{
        fontSize: 10, color: highlight ? 'rgba(255,255,255,0.85)' : 'var(--textMute)',
        fontWeight: 600, letterSpacing: '0.04em',
      }}>{label}</div>
      <div style={{
        fontSize: 18, fontWeight: 700, color: highlight ? '#fff' : 'var(--text)',
        fontFamily: 'var(--fontHeading)', lineHeight: 1,
      }}>
        {value}<span style={{ fontSize: 11, fontWeight: 500, marginLeft: 2, opacity: 0.8 }}>{suffix}</span>
      </div>
    </div>
  );
}

function MemberCard({ member, rank, expectedPct, cheers, isMe, onCheer }) {
  const isAhead = member.percent >= expectedPct;
  const recentCheers = cheers.slice(-3);

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      padding: 14, display: 'flex', alignItems: 'center', gap: 12,
      border: isMe ? '2px solid var(--accent)' : '1px solid var(--border)',
      boxShadow: 'var(--cardShadow)',
      position: 'relative',
    }}>
      {/* 순위 */}
      <div style={{
        width: 28, textAlign: 'center', fontSize: 14, fontWeight: 700,
        color: rank <= 3 ? 'var(--accent)' : 'var(--textMute)',
        fontFamily: 'var(--fontHeading)',
        flexShrink: 0,
      }}>
        {rank === 1 ? '🌿' : rank}
      </div>

      <Avatar name={member.name} color={member.color} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <span style={{
            fontSize: 15, fontWeight: 600, color: 'var(--text)',
            fontFamily: 'var(--fontHeading)',
          }}>{member.name}</span>
          {isMe && <span style={{
            fontSize: 10, color: 'var(--accent)', fontWeight: 700,
            background: 'var(--accentSoft)', padding: '2px 6px', borderRadius: 6,
          }}>나</span>}
        </div>
        <ProgressBar percent={member.percent} height={6} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
          fontSize: 11, color: 'var(--textSub)', whiteSpace: 'nowrap',
        }}>
          <span><b style={{ color: 'var(--text)' }}>{member.read}</b><span style={{ color: 'var(--textMute)' }}>/{member.total}</span></span>
          <span style={{ color: 'var(--textMute)' }}>·</span>
          <span>하루 {member.perDay}장</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{
          fontSize: 18, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--fontHeading)', lineHeight: 1,
        }}>
          {Math.round(member.percent)}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--textMute)' }}>%</span>
        </div>
        {recentCheers.length > 0 && (
          <div style={{ display: 'flex', gap: -4 }}>
            {recentCheers.map((c, i) => (
              <span key={c.id} style={{ fontSize: 12, marginLeft: i === 0 ? 0 : -4 }}>{c.emoji}</span>
            ))}
          </div>
        )}
      </div>

      {!isMe && (
        <button onClick={onCheer} style={{
          ...iconBtn, width: 32, height: 32,
          background: 'var(--surfaceAlt)',
          fontSize: 14,
        }}>
          🙏
        </button>
      )}
    </div>
  );
}

// =============== 응원 시트 ===============
function CheerSheet({ target, onClose, onSend }) {
  const emojis = ['🙏', '❤️', '👏', '✨', '🔥', '🌿', '☀️', '💪'];
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 32px', width: '100%',
      }}>
        <div style={{
          width: 36, height: 4, background: 'var(--border)',
          borderRadius: 2, margin: '0 auto 16px',
        }} />
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Avatar name={target.name} color={target.color} size={48} />
          <div style={{
            marginTop: 8, fontSize: 16, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'var(--fontHeading)',
          }}>
            {target.name}님에게 응원 보내기
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {emojis.map(e => (
            <button key={e} onClick={() => onSend(e)} style={{
              padding: '14px 0', fontSize: 28, border: '1px solid var(--border)',
              background: 'var(--surfaceAlt)', borderRadius: 'var(--radiusSm)',
              cursor: 'pointer',
            }}>{e}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== 읽기 체크 화면 ===============
function ReadScreen({ group, member, memberProgress, onToggle, onBulkSet, onBack }) {
  const [mode, setMode] = useState('book'); // book | quick | range
  const [selectedBook, setSelectedBook] = useState(null);
  const [oldExpanded, setOldExpanded] = useState(true);
  const [newExpanded, setNewExpanded] = useState(true);

  if (selectedBook) {
    return <ChapterGrid book={selectedBook} memberProgress={memberProgress}
      onToggle={onToggle} onBack={() => setSelectedBook(null)} />;
  }

  const oldBooks = window.BIBLE_BOOKS.filter(b => b.testament === 'old');
  const newBooks = window.BIBLE_BOOKS.filter(b => b.testament === 'new');

  return (
    <div style={{ paddingBottom: 80 }}>
      <ScreenHeader title="읽은 장 체크" subtitle={member.name} onBack={onBack} />

      {/* 입력 모드 탭 */}
      <div style={{
        margin: '12px 16px 16px', padding: 4,
        background: 'var(--surfaceAlt)', borderRadius: 'var(--radiusSm)',
        display: 'flex', gap: 4,
      }}>
        {[
          { k: 'book', label: '책별 체크' },
          { k: 'quick', label: '여기까지 읽음' },
          { k: 'range', label: '범위 선택' },
        ].map(t => (
          <button key={t.k} onClick={() => setMode(t.k)} style={{
            flex: 1, padding: '8px 0', border: 'none',
            background: mode === t.k ? 'var(--surface)' : 'transparent',
            color: mode === t.k ? 'var(--text)' : 'var(--textSub)',
            fontWeight: mode === t.k ? 700 : 500,
            borderRadius: 8, fontSize: 12, cursor: 'pointer',
            boxShadow: mode === t.k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            fontFamily: 'var(--fontBody)',
          }}>{t.label}</button>
        ))}
      </div>

      {mode === 'quick' && (
        <QuickProgressMode memberProgress={memberProgress} onApply={onBulkSet} />
      )}

      {mode === 'range' && (
        <RangeMode memberProgress={memberProgress} onApply={onBulkSet} />
      )}

      {mode === 'book' && (
        <div style={{ padding: '0 16px' }}>
          <BookSection title="구약" books={oldBooks} memberProgress={memberProgress}
            expanded={oldExpanded} onToggle={() => setOldExpanded(v => !v)}
            onSelectBook={setSelectedBook} />
          <BookSection title="신약" books={newBooks} memberProgress={memberProgress}
            expanded={newExpanded} onToggle={() => setNewExpanded(v => !v)}
            onSelectBook={setSelectedBook} />
        </div>
      )}
    </div>
  );
}

function BookSection({ title, books, memberProgress, expanded, onToggle, onSelectBook }) {
  // 카테고리별로 묶기
  const grouped = {};
  for (const b of books) {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '12px 4px', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer',
      }}>
        <span style={{
          fontSize: 15, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--fontHeading)',
        }}>{title}</span>
        <span style={{ color: 'var(--textMute)', fontSize: 12 }}>
          {expanded ? '−' : '+'}
        </span>
      </button>
      {expanded && Object.entries(grouped).map(([cat, bks]) => (
        <div key={cat} style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, color: 'var(--textMute)', fontWeight: 600,
            letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 4,
          }}>
            {cat}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {bks.map(b => {
              let read = 0;
              for (let ch = 1; ch <= b.chapters; ch++) {
                if (memberProgress[`${b.id}-${ch}`]) read++;
              }
              const pct = (read / b.chapters) * 100;
              return (
                <button key={b.id} onClick={() => onSelectBook(b)} style={{
                  textAlign: 'left', padding: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radiusSm)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--text)',
                      fontFamily: 'var(--fontHeading)',
                    }}>{b.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--textMute)' }}>
                      {read}/{b.chapters}
                    </span>
                  </div>
                  <ProgressBar percent={pct} height={4} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChapterGrid({ book, memberProgress, onToggle, onBack }) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const readCount = chapters.filter(ch => memberProgress[`${book.id}-${ch}`]).length;
  return (
    <div style={{ paddingBottom: 80 }}>
      <ScreenHeader title={book.name} subtitle={`${readCount} / ${book.chapters}장 완료`} onBack={onBack} />
      <div style={{ padding: '12px 16px' }}>
        <ProgressBar percent={(readCount / book.chapters) * 100} height={6} />
      </div>
      <div style={{
        padding: '12px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
      }}>
        {chapters.map(ch => {
          const checked = !!memberProgress[`${book.id}-${ch}`];
          return (
            <button key={ch} onClick={() => onToggle(book.id, ch)} style={{
              aspectRatio: '1', border: checked ? 'none' : '1.5px solid var(--border)',
              background: checked ? 'var(--accent)' : 'var(--surface)',
              color: checked ? '#fff' : 'var(--textSub)',
              borderRadius: 'var(--radiusSm)', fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--fontHeading)',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {ch}
              {checked && (
                <div style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8,
                }}>✓</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============== Quick / Range 모드 ===============
function QuickProgressMode({ memberProgress, onApply }) {
  const [bookId, setBookId] = useState(window.BIBLE_BOOKS[0].id);
  const [chapter, setChapter] = useState(1);
  const book = window.BIBLE_BOOKS.find(b => b.id === bookId);

  const applyQuick = () => {
    // 처음부터 선택한 책-장까지 모두 체크
    const keys = {};
    for (const b of window.BIBLE_BOOKS) {
      for (let ch = 1; ch <= b.chapters; ch++) {
        keys[`${b.id}-${ch}`] = true;
        if (b.id === bookId && ch === chapter) {
          onApply(keys);
          return;
        }
      }
    }
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        padding: 16, background: 'var(--surfaceAlt)',
        borderRadius: 'var(--radius)', marginBottom: 12,
      }}>
        <div style={{ fontSize: 13, color: 'var(--textSub)', marginBottom: 12 }}>
          창세기 1장부터 선택한 지점까지 한번에 체크됩니다.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={bookId} onChange={e => { setBookId(e.target.value); setChapter(1); }} style={selectStyle}>
            {window.BIBLE_BOOKS.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select value={chapter} onChange={e => setChapter(+e.target.value)} style={{ ...selectStyle, maxWidth: 100 }}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map(c => (
              <option key={c} value={c}>{c}장</option>
            ))}
          </select>
        </div>
        <button onClick={applyQuick} style={{ ...primaryBtn, width: '100%', marginTop: 12 }}>
          여기까지 읽음으로 표시
        </button>
      </div>
    </div>
  );
}

function RangeMode({ memberProgress, onApply }) {
  const [bookId, setBookId] = useState(window.BIBLE_BOOKS[0].id);
  const [fromCh, setFromCh] = useState(1);
  const [toCh, setToCh] = useState(1);
  const book = window.BIBLE_BOOKS.find(b => b.id === bookId);

  const apply = (checked) => {
    const updates = {};
    for (let ch = Math.min(fromCh, toCh); ch <= Math.max(fromCh, toCh); ch++) {
      updates[`${bookId}-${ch}`] = checked;
    }
    onApply(updates, !checked);
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        padding: 16, background: 'var(--surfaceAlt)',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--textSub)', marginBottom: 12 }}>
          한 책에서 여러 장을 한번에 체크/해제합니다.
        </div>
        <select value={bookId} onChange={e => { setBookId(e.target.value); setFromCh(1); setToCh(1); }}
          style={{ ...selectStyle, width: '100%', marginBottom: 8 }}>
          {window.BIBLE_BOOKS.map(b => (
            <option key={b.id} value={b.id}>{b.name} ({b.chapters}장)</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={fromCh} onChange={e => setFromCh(+e.target.value)} style={selectStyle}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map(c => (
              <option key={c} value={c}>{c}장</option>
            ))}
          </select>
          <span style={{ color: 'var(--textMute)' }}>~</span>
          <select value={toCh} onChange={e => setToCh(+e.target.value)} style={selectStyle}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map(c => (
              <option key={c} value={c}>{c}장</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => apply(true)} style={{ ...primaryBtn, flex: 1 }}>
            범위 체크
          </button>
          <button onClick={() => apply(false)} style={{
            ...primaryBtn, flex: 1,
            background: 'var(--surface)', color: 'var(--text)',
            border: '1px solid var(--border)',
          }}>
            범위 해제
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== 통계 화면 ===============
function StatsScreen({ group, members, progressMap, cheers, onBack }) {
  const ranked = useMemo(() => {
    return members.map(m => {
      const prog = window.calcProgress(progressMap[m.id] || {}, group.scope);
      const weekly = window.calcWeeklyReads(progressMap[m.id] || {});
      const cheerCount = cheers.filter(c => c.to === m.id).length;
      return { ...m, ...prog, weekly, cheerCount };
    });
  }, [members, progressMap, group, cheers]);

  const totalRead = ranked.reduce((s, m) => s + m.read, 0);
  const totalPossible = ranked.reduce((s, m) => s + m.total, 0);
  const avgPct = totalPossible ? (totalRead / totalPossible) * 100 : 0;
  const weeklyChampion = [...ranked].sort((a, b) => b.weekly - a.weekly)[0];
  const mostCheered = [...ranked].sort((a, b) => b.cheerCount - a.cheerCount)[0];
  const totalWeekly = ranked.reduce((s, m) => s + m.weekly, 0);

  return (
    <div style={{ paddingBottom: 80 }}>
      <ScreenHeader title="다락방 통계" onBack={onBack} />

      <div style={{ padding: '0 16px' }}>
        {/* 전체 진도 카드 */}
        <div style={{
          padding: 20, background: 'var(--accentSoft)',
          borderRadius: 'var(--radius)', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <ProgressRing percent={avgPct} size={80} stroke={7} color="var(--accentDeep)" />
          <div>
            <div style={{ fontSize: 12, color: 'var(--accentDeep)', fontWeight: 600 }}>
              다락방 전체 평균
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: 'var(--text)',
              fontFamily: 'var(--fontHeading)', lineHeight: 1.2,
            }}>
              {Math.round(avgPct)}% 완료
            </div>
            <div style={{ fontSize: 12, color: 'var(--textSub)', marginTop: 4 }}>
              누적 {totalRead.toLocaleString()}장 읽음
            </div>
          </div>
        </div>

        {/* 이번 주 챔피언 */}
        <div style={{
          padding: 16, background: 'var(--surface)',
          borderRadius: 'var(--radius)', marginBottom: 12,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: 12, color: 'var(--textMute)', fontWeight: 600,
            letterSpacing: '0.06em', marginBottom: 10,
          }}>이번 주 가장 많이 읽은 사람</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={weeklyChampion.name} color={weeklyChampion.color} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: 'var(--text)',
                fontFamily: 'var(--fontHeading)',
              }}>{weeklyChampion.name}</div>
              <div style={{ fontSize: 12, color: 'var(--textSub)' }}>
                이번 주 {weeklyChampion.weekly}장 읽음
              </div>
            </div>
            <div style={{ fontSize: 28 }}>🌿</div>
          </div>
        </div>

        {/* 가장 많은 응원 */}
        <div style={{
          padding: 16, background: 'var(--surface)',
          borderRadius: 'var(--radius)', marginBottom: 16,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: 12, color: 'var(--textMute)', fontWeight: 600,
            letterSpacing: '0.06em', marginBottom: 10,
          }}>가장 많은 응원을 받은 사람</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={mostCheered.name} color={mostCheered.color} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: 'var(--text)',
                fontFamily: 'var(--fontHeading)',
              }}>{mostCheered.name}</div>
              <div style={{ fontSize: 12, color: 'var(--textSub)' }}>
                받은 응원 {mostCheered.cheerCount}개
              </div>
            </div>
            <div style={{ fontSize: 22 }}>🙏</div>
          </div>
        </div>

        {/* 이번 주 막대 차트 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'var(--fontHeading)', marginBottom: 12,
          }}>이번 주 읽은 장 수</div>
          <div style={{
            padding: 16, background: 'var(--surface)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {ranked.map(m => {
              const max = Math.max(1, ...ranked.map(r => r.weekly));
              const w = (m.weekly / max) * 100;
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={m.name} color={m.color} size={28} />
                  <div style={{ width: 56, fontSize: 12, color: 'var(--textSub)' }}>{m.name}</div>
                  <div style={{ flex: 1, position: 'relative', height: 18, background: 'var(--surfaceAlt)', borderRadius: 4 }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${w}%`, background: m.color, borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ width: 36, textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    {m.weekly}장
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== 설정 화면 ===============
function SettingsScreen({ group, currentMember, members, onBack, onUpdateGroup, onAddMember, onResetAll, onShare, onSwitchUser }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(group);

  const save = () => {
    onUpdateGroup(draft);
    setEditing(false);
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <ScreenHeader title="설정" onBack={onBack} />

      <div style={{ padding: '0 16px' }}>
        {/* 다락방 정보 */}
        <SectionHeader>다락방 정보</SectionHeader>
        <div style={{
          padding: 16, background: 'var(--surface)',
          borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="다락방 이름">
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="시작일">
                <input type="date" value={draft.startDate} onChange={e => setDraft({ ...draft, startDate: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="종료일">
                <input type="date" value={draft.endDate} onChange={e => setDraft({ ...draft, endDate: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="통독 범위">
                <select value={draft.scope} onChange={e => setDraft({ ...draft, scope: e.target.value })} style={{ ...inputStyle, padding: '10px 8px' }}>
                  <option value="all">성경 전체 (1189장)</option>
                  <option value="old">구약만 (929장)</option>
                  <option value="new">신약만 (260장)</option>
                </select>
              </Field>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button onClick={() => { setEditing(false); setDraft(group); }}
                  style={{ ...primaryBtn, flex: 1, background: 'var(--surfaceAlt)', color: 'var(--text)' }}>
                  취소
                </button>
                <button onClick={save} style={{ ...primaryBtn, flex: 1 }}>저장</button>
              </div>
            </div>
          ) : (
            <>
              <Row label="다락방 이름" value={group.name} />
              <Row label="시작일" value={fmtDate(group.startDate)} />
              <Row label="종료일" value={fmtDate(group.endDate)} />
              <Row label="통독 범위" value={
                group.scope === 'all' ? '성경 전체 (1189장)' :
                group.scope === 'old' ? '구약만 (929장)' : '신약만 (260장)'
              } isLast />
              <button onClick={() => setEditing(true)} style={{
                ...primaryBtn, width: '100%', marginTop: 12,
                background: 'var(--surfaceAlt)', color: 'var(--text)',
              }}>
                수정하기
              </button>
            </>
          )}
        </div>

        {/* 멤버 */}
        <SectionHeader>멤버 ({members.length}명)</SectionHeader>
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', marginBottom: 16, overflow: 'hidden',
        }}>
          {members.map((m, i) => (
            <div key={m.id} onClick={() => onSwitchUser(m.id)} style={{
              padding: 14, display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              background: m.id === currentMember.id ? 'var(--surfaceAlt)' : 'transparent',
            }}>
              <Avatar name={m.name} color={m.color} size={36} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--fontHeading)' }}>
                {m.name}
              </div>
              {m.id === currentMember.id && (
                <span style={{
                  fontSize: 10, color: 'var(--accent)', fontWeight: 700,
                  background: 'var(--accentSoft)', padding: '3px 8px', borderRadius: 6,
                }}>나</span>
              )}
            </div>
          ))}
          <button onClick={onAddMember} style={{
            width: '100%', padding: 14, background: 'transparent',
            border: 'none', borderTop: '1px solid var(--border)',
            color: 'var(--accent)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            + 멤버 추가
          </button>
        </div>

        {/* 공유 */}
        <SectionHeader>공유</SectionHeader>
        <button onClick={onShare} style={{
          width: '100%', padding: 14, background: '#FEE500',
          color: '#3C1E1E', border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          💬 카카오톡으로 다락방 공유
        </button>

        {/* 다른 작업 */}
        <SectionHeader>다른 작업</SectionHeader>
        {onLogout && (
          <button onClick={onLogout} style={{
            width: '100%', padding: 14, background: 'var(--surfaceAlt)',
            color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            marginBottom: 8,
          }}>
            로그아웃
          </button>
        )}
        <button onClick={onResetAll} style={{
          width: '100%', padding: 14, background: 'transparent',
          color: '#C95252', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          전체 기록 초기화
        </button>
      </div>
    </div>
  );
}

// =============== 로그인/온보딩 ===============
function LoginScreen({ group, members, onLogin }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!selectedMember) return;
    if (pin !== selectedMember.pinHash) {
      setError('PIN이 맞지 않습니다');
      return;
    }
    onLogin(selectedMember);
  };

  if (selectedMember) {
    return (
      <div style={{ padding: 24, paddingTop: 60 }}>
        <button onClick={() => { setSelectedMember(null); setPin(''); setError(''); }} style={{
          background: 'none', border: 'none', color: 'var(--textSub)',
          fontSize: 14, marginBottom: 24, cursor: 'pointer', padding: 0,
        }}>← 다른 이름 선택</button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar name={selectedMember.name} color={selectedMember.color} size={72} />
          <div style={{
            marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'var(--fontHeading)',
          }}>
            안녕하세요, {selectedMember.name}님
          </div>
          <div style={{ fontSize: 13, color: 'var(--textSub)', marginTop: 6 }}>
            4자리 PIN을 입력해주세요
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16,
        }}>
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

        {error && <div style={{ textAlign: 'center', color: '#C95252', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ fontSize: 11, color: 'var(--textMute)', textAlign: 'center', marginBottom: 12 }}>
          💡 데모용 PIN: 0000
        </div>

        {/* 키패드 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => { setPin(p => (p + n).slice(0, 4)); setError(''); }}
              style={keyStyle}>{n}</button>
          ))}
          <div />
          <button onClick={() => { setPin(p => (p + '0').slice(0, 4)); setError(''); }} style={keyStyle}>0</button>
          <button onClick={() => setPin(p => p.slice(0, -1))} style={{ ...keyStyle, background: 'transparent', fontSize: 18 }}>⌫</button>
        </div>

        <button onClick={submit} disabled={pin.length !== 4} style={{
          ...primaryBtn, width: '100%', marginTop: 20,
          opacity: pin.length === 4 ? 1 : 0.4,
        }}>
          입장하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, paddingTop: 50 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
        <div style={{
          fontSize: 12, color: 'var(--accent)', fontWeight: 600,
          letterSpacing: '0.08em', marginBottom: 6,
        }}>
          교회 다락방 · 성경 통독
        </div>
        <div style={{
          fontSize: 26, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--fontHeading)',
        }}>
          {group.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--textSub)', marginTop: 8 }}>
          {fmtDate(group.startDate)} ~ {fmtDate(group.endDate)}
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--textSub)', marginBottom: 12, textAlign: 'center' }}>
        본인의 이름을 선택해주세요
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map(m => (
          <button key={m.id} onClick={() => setSelectedMember(m)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 14,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
          }}>
            <Avatar name={m.name} color={m.color} size={36} />
            <span style={{
              flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text)',
              fontFamily: 'var(--fontHeading)',
            }}>{m.name}</span>
            <span style={{ color: 'var(--textMute)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============== 공용 컴포넌트 ===============
function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <div style={{
      padding: '16px 16px 12px', background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button onClick={onBack} style={{
        ...iconBtn, background: 'transparent', fontSize: 18, color: 'var(--text)',
      }}>‹</button>
      <div>
        <div style={{
          fontSize: 17, fontWeight: 700, color: 'var(--text)',
          fontFamily: 'var(--fontHeading)', lineHeight: 1.2,
        }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--textSub)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--textMute)', fontWeight: 600,
      letterSpacing: '0.08em', marginTop: 16, marginBottom: 8, paddingLeft: 4,
    }}>
      {children}
    </div>
  );
}

function Row({ label, value, isLast }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--textSub)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--fontHeading)' }}>{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--textMute)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.04em' }}>{label}</div>
      {children}
    </div>
  );
}

// =============== 아이콘 ===============
function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

// =============== 공용 스타일 ===============
const iconBtn = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'var(--surfaceAlt)', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--textSub)',
};

const primaryBtn = {
  padding: '12px 16px', background: 'var(--accent)',
  color: '#fff', border: 'none', borderRadius: 'var(--radiusSm)',
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  fontFamily: 'var(--fontBody)',
};

const inputStyle = {
  padding: '10px 12px', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: 'var(--radiusSm)',
  fontSize: 14, color: 'var(--text)', width: '100%',
  fontFamily: 'var(--fontBody)',
};

const selectStyle = {
  ...inputStyle, padding: '10px 8px', flex: 1,
};

const keyStyle = {
  height: 56, fontSize: 22, fontWeight: 600,
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radiusSm)', color: 'var(--text)',
  cursor: 'pointer', fontFamily: 'var(--fontHeading)',
};

// expose globally
Object.assign(window, {
  HomeScreen, ReadScreen, StatsScreen, SettingsScreen, LoginScreen,
  ProgressBar, ProgressRing, Avatar,
});
