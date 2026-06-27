// 개역개정 성경 66권 + 각 권의 장 수
window.BIBLE_BOOKS = [
  // 구약 (Old Testament) - 39권 929장
  { id: 'gen', name: '창세기', short: '창', chapters: 50, testament: 'old', category: '모세오경' },
  { id: 'exo', name: '출애굽기', short: '출', chapters: 40, testament: 'old', category: '모세오경' },
  { id: 'lev', name: '레위기', short: '레', chapters: 27, testament: 'old', category: '모세오경' },
  { id: 'num', name: '민수기', short: '민', chapters: 36, testament: 'old', category: '모세오경' },
  { id: 'deu', name: '신명기', short: '신', chapters: 34, testament: 'old', category: '모세오경' },
  { id: 'jos', name: '여호수아', short: '수', chapters: 24, testament: 'old', category: '역사서' },
  { id: 'jdg', name: '사사기', short: '삿', chapters: 21, testament: 'old', category: '역사서' },
  { id: 'rut', name: '룻기', short: '룻', chapters: 4, testament: 'old', category: '역사서' },
  { id: '1sa', name: '사무엘상', short: '삼상', chapters: 31, testament: 'old', category: '역사서' },
  { id: '2sa', name: '사무엘하', short: '삼하', chapters: 24, testament: 'old', category: '역사서' },
  { id: '1ki', name: '열왕기상', short: '왕상', chapters: 22, testament: 'old', category: '역사서' },
  { id: '2ki', name: '열왕기하', short: '왕하', chapters: 25, testament: 'old', category: '역사서' },
  { id: '1ch', name: '역대상', short: '대상', chapters: 29, testament: 'old', category: '역사서' },
  { id: '2ch', name: '역대하', short: '대하', chapters: 36, testament: 'old', category: '역사서' },
  { id: 'ezr', name: '에스라', short: '스', chapters: 10, testament: 'old', category: '역사서' },
  { id: 'neh', name: '느헤미야', short: '느', chapters: 13, testament: 'old', category: '역사서' },
  { id: 'est', name: '에스더', short: '에', chapters: 10, testament: 'old', category: '역사서' },
  { id: 'job', name: '욥기', short: '욥', chapters: 42, testament: 'old', category: '시가서' },
  { id: 'psa', name: '시편', short: '시', chapters: 150, testament: 'old', category: '시가서' },
  { id: 'pro', name: '잠언', short: '잠', chapters: 31, testament: 'old', category: '시가서' },
  { id: 'ecc', name: '전도서', short: '전', chapters: 12, testament: 'old', category: '시가서' },
  { id: 'sng', name: '아가', short: '아', chapters: 8, testament: 'old', category: '시가서' },
  { id: 'isa', name: '이사야', short: '사', chapters: 66, testament: 'old', category: '대선지서' },
  { id: 'jer', name: '예레미야', short: '렘', chapters: 52, testament: 'old', category: '대선지서' },
  { id: 'lam', name: '예레미야애가', short: '애', chapters: 5, testament: 'old', category: '대선지서' },
  { id: 'ezk', name: '에스겔', short: '겔', chapters: 48, testament: 'old', category: '대선지서' },
  { id: 'dan', name: '다니엘', short: '단', chapters: 12, testament: 'old', category: '대선지서' },
  { id: 'hos', name: '호세아', short: '호', chapters: 14, testament: 'old', category: '소선지서' },
  { id: 'jol', name: '요엘', short: '욜', chapters: 3, testament: 'old', category: '소선지서' },
  { id: 'amo', name: '아모스', short: '암', chapters: 9, testament: 'old', category: '소선지서' },
  { id: 'oba', name: '오바댜', short: '옵', chapters: 1, testament: 'old', category: '소선지서' },
  { id: 'jon', name: '요나', short: '욘', chapters: 4, testament: 'old', category: '소선지서' },
  { id: 'mic', name: '미가', short: '미', chapters: 7, testament: 'old', category: '소선지서' },
  { id: 'nam', name: '나훔', short: '나', chapters: 3, testament: 'old', category: '소선지서' },
  { id: 'hab', name: '하박국', short: '합', chapters: 3, testament: 'old', category: '소선지서' },
  { id: 'zep', name: '스바냐', short: '습', chapters: 3, testament: 'old', category: '소선지서' },
  { id: 'hag', name: '학개', short: '학', chapters: 2, testament: 'old', category: '소선지서' },
  { id: 'zec', name: '스가랴', short: '슥', chapters: 14, testament: 'old', category: '소선지서' },
  { id: 'mal', name: '말라기', short: '말', chapters: 4, testament: 'old', category: '소선지서' },

  // 신약 (New Testament) - 27권 260장
  { id: 'mat', name: '마태복음', short: '마', chapters: 28, testament: 'new', category: '복음서' },
  { id: 'mrk', name: '마가복음', short: '막', chapters: 16, testament: 'new', category: '복음서' },
  { id: 'luk', name: '누가복음', short: '눅', chapters: 24, testament: 'new', category: '복음서' },
  { id: 'jhn', name: '요한복음', short: '요', chapters: 21, testament: 'new', category: '복음서' },
  { id: 'act', name: '사도행전', short: '행', chapters: 28, testament: 'new', category: '역사서' },
  { id: 'rom', name: '로마서', short: '롬', chapters: 16, testament: 'new', category: '바울서신' },
  { id: '1co', name: '고린도전서', short: '고전', chapters: 16, testament: 'new', category: '바울서신' },
  { id: '2co', name: '고린도후서', short: '고후', chapters: 13, testament: 'new', category: '바울서신' },
  { id: 'gal', name: '갈라디아서', short: '갈', chapters: 6, testament: 'new', category: '바울서신' },
  { id: 'eph', name: '에베소서', short: '엡', chapters: 6, testament: 'new', category: '바울서신' },
  { id: 'php', name: '빌립보서', short: '빌', chapters: 4, testament: 'new', category: '바울서신' },
  { id: 'col', name: '골로새서', short: '골', chapters: 4, testament: 'new', category: '바울서신' },
  { id: '1th', name: '데살로니가전서', short: '살전', chapters: 5, testament: 'new', category: '바울서신' },
  { id: '2th', name: '데살로니가후서', short: '살후', chapters: 3, testament: 'new', category: '바울서신' },
  { id: '1ti', name: '디모데전서', short: '딤전', chapters: 6, testament: 'new', category: '바울서신' },
  { id: '2ti', name: '디모데후서', short: '딤후', chapters: 4, testament: 'new', category: '바울서신' },
  { id: 'tit', name: '디도서', short: '딛', chapters: 3, testament: 'new', category: '바울서신' },
  { id: 'phm', name: '빌레몬서', short: '몬', chapters: 1, testament: 'new', category: '바울서신' },
  { id: 'heb', name: '히브리서', short: '히', chapters: 13, testament: 'new', category: '일반서신' },
  { id: 'jas', name: '야고보서', short: '약', chapters: 5, testament: 'new', category: '일반서신' },
  { id: '1pe', name: '베드로전서', short: '벧전', chapters: 5, testament: 'new', category: '일반서신' },
  { id: '2pe', name: '베드로후서', short: '벧후', chapters: 3, testament: 'new', category: '일반서신' },
  { id: '1jn', name: '요한일서', short: '요일', chapters: 5, testament: 'new', category: '일반서신' },
  { id: '2jn', name: '요한이서', short: '요이', chapters: 1, testament: 'new', category: '일반서신' },
  { id: '3jn', name: '요한삼서', short: '요삼', chapters: 1, testament: 'new', category: '일반서신' },
  { id: 'jud', name: '유다서', short: '유', chapters: 1, testament: 'new', category: '일반서신' },
  { id: 'rev', name: '요한계시록', short: '계', chapters: 22, testament: 'new', category: '예언서' },
];

// 누적 장 수 계산용
window.BIBLE_TOTAL_CHAPTERS = window.BIBLE_BOOKS.reduce((s, b) => s + b.chapters, 0); // 1189
window.BIBLE_OLD_CHAPTERS = window.BIBLE_BOOKS.filter(b => b.testament === 'old').reduce((s, b) => s + b.chapters, 0); // 929
window.BIBLE_NEW_CHAPTERS = window.BIBLE_BOOKS.filter(b => b.testament === 'new').reduce((s, b) => s + b.chapters, 0); // 260

// 데모 데이터 - 탄방5다락방
window.DEMO_GROUP = {
  name: '탄방5다락방',
  startDate: '2026-05-01',
  endDate: '2026-10-31', // 약 184일 (6개월)
  scope: 'all', // all | old | new
};

// 데모 멤버 (PIN은 데모용으로 모두 '0000')
window.DEMO_MEMBERS = [
  { id: 'm1', name: '김은혜', color: '#C9876A', pinHash: '0000' },
  { id: 'm2', name: '박소망', color: '#A89372', pinHash: '0000' },
  { id: 'm3', name: '이사랑', color: '#8B9D77', pinHash: '0000' },
  { id: 'm4', name: '정평강', color: '#B8855A', pinHash: '0000' },
  { id: 'm5', name: '최기쁨', color: '#D4A574', pinHash: '0000' },
  { id: 'm6', name: '강믿음', color: '#9C7B5B', pinHash: '0000' },
  { id: 'm7', name: '조감사', color: '#C19A6B', pinHash: '0000' },
  { id: 'm8', name: '윤찬양', color: '#A67F5D', pinHash: '0000' },
];

// 데모 진도 - 멤버별로 다른 진도율 (현실적으로 다양하게)
// 키 포맷: "bookId-chapterNum" 예: "gen-1"
function buildDemoProgress() {
  const progress = {};
  // 각 멤버별로 누적 장 수 만큼 순서대로 체크
  const targetByMember = {
    m1: 720, // 60% - 1등
    m2: 640, // 54%
    m3: 580, // 49%
    m4: 510, // 43% - 평균
    m5: 480, // 40%
    m6: 420, // 35%
    m7: 350, // 29%
    m8: 260, // 22% - 신약 직전까지
  };

  // 시작일 기준으로 시간 분배 (5/1 ~ 오늘까지 자연스럽게)
  const startMs = new Date('2026-05-01').getTime();
  const nowMs = Date.now();
  const spanMs = Math.max(1, nowMs - startMs);

  for (const [memberId, target] of Object.entries(targetByMember)) {
    const checks = {};
    let count = 0;
    for (const book of window.BIBLE_BOOKS) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        if (count >= target) break;
        // 진도에 비례해서 시간 배분 (앞쪽 장은 오래전, 최근 장은 최근)
        checks[`${book.id}-${ch}`] = startMs + (count / target) * spanMs;
        count++;
      }
      if (count >= target) break;
    }
    progress[memberId] = checks;
  }
  return progress;
}

window.DEMO_PROGRESS = buildDemoProgress();

// 데모 응원 (cheers)
window.DEMO_CHEERS = [
  { id: 'c1', from: 'm3', to: 'm1', emoji: '🔥', at: Date.now() - 3600000 },
  { id: 'c2', from: 'm2', to: 'm1', emoji: '👏', at: Date.now() - 7200000 },
  { id: 'c3', from: 'm1', to: 'm8', emoji: '🙏', at: Date.now() - 1800000 },
  { id: 'c4', from: 'm4', to: 'm3', emoji: '✨', at: Date.now() - 86400000 },
  { id: 'c5', from: 'm5', to: 'm2', emoji: '❤️', at: Date.now() - 172800000 },
];

// 유틸: 멤버별 진도 계산
window.calcProgress = function(memberProgress, scope = 'all') {
  const books = window.BIBLE_BOOKS.filter(b => scope === 'all' || b.testament === scope);
  const total = books.reduce((s, b) => s + b.chapters, 0);
  let read = 0;
  for (const book of books) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      if (memberProgress[`${book.id}-${ch}`]) read++;
    }
  }
  return { read, total, percent: total ? (read / total) * 100 : 0 };
};

// 유틸: 남은 기간 동안 하루 평균 몇 장
window.calcDailyTarget = function(memberProgress, group) {
  const { read, total } = window.calcProgress(memberProgress, group.scope);
  const remaining = total - read;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(group.endDate);
  end.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(1, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
  return {
    remaining,
    daysLeft,
    perDay: Math.ceil(remaining / daysLeft),
    onTrack: remaining === 0 || (read / total) >= getExpectedProgress(group),
  };
};

// 현재 시점에 기대되는 진도율 (시작일~종료일 비례)
function getExpectedProgress(group) {
  const start = new Date(group.startDate).getTime();
  const end = new Date(group.endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
}
window.getExpectedProgress = getExpectedProgress;

// 이번 주(월~일) 읽은 장 수
window.calcWeeklyReads = function(memberProgress) {
  const now = new Date();
  const day = now.getDay(); // 0 (일) ~ 6 (토)
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  let count = 0;
  for (const ts of Object.values(memberProgress)) {
    if (ts >= monday.getTime()) count++;
  }
  return count;
};
