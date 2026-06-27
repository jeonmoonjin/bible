# 탄방5다락방 성경 통독 트래커

교회 다락방(소그룹) 단위의 성경 통독 진도 관리 모바일 웹 앱.

## 빠른 시작

이 폴더는 정적 파일로만 구성되어 있어요. Vercel, Netlify, Firebase Hosting, GitHub Pages 어디든 그대로 올리면 작동합니다. 빌드 명령어 필요 없습니다.

### 로컬에서 미리보기

```bash
# 폴더 안에서
npx serve .
# 또는
python3 -m http.server 8000
```

브라우저에서 `http://localhost:3000` (또는 8000) 접속.

## 배포 (Vercel 추천)

1. 이 폴더를 GitHub에 새 저장소로 푸시
2. [vercel.com](https://vercel.com) 가입 후 "Add New → Project"
3. GitHub 저장소 선택 → Import
4. 빌드 설정은 **건드리지 마세요** (정적 사이트로 자동 인식)
5. Deploy 클릭 → 1~2분 뒤 `https://your-app.vercel.app` 도메인 생성

### Firebase에 도메인 등록

Vercel 도메인이 생성되면 **반드시** Firebase 콘솔에 등록해야 인증이 작동합니다:

1. [Firebase 콘솔](https://console.firebase.google.com) → 프로젝트 `saeronam-bible`
2. Authentication → Settings → "승인된 도메인"
3. "도메인 추가" → `your-app.vercel.app` 입력

## 파일 구성

| File | 역할 |
|---|---|
| `index.html` | 메인 엔트리 |
| `firebase-config.js` | Firebase 초기화, 익명 로그인 |
| `bible-data.js` | 성경 66권 메타데이터 + 진도 계산 유틸 |
| `theme.js` | 3가지 테마 (warm / scripture / cream) CSS 변수 |
| `tweaks_panel.jsx` | 디자인 시안 전환 패널 (개발자 환경에서만 보임) |
| `screens.jsx` | Home / Read / Stats / Settings 화면 |
| `screens-auth.jsx` | 가입/로그인 화면 |
| `app-firebase.jsx` | 메인 앱 로직, Firestore 실시간 구독 |
| `manifest.json` | PWA 매니페스트 (홈 화면 추가용) |
| `vercel.json` | Vercel 설정 (캐시 헤더) |

## 여러 다락방 지원

URL 끝에 `?g={다락방ID}`를 붙이면 다른 다락방을 만들 수 있어요.

- `https://your-app.vercel.app/` → 기본 (`tanbang5`)
- `https://your-app.vercel.app/?g=tanbang6` → 새 다락방 6
- `https://your-app.vercel.app/?g=youth` → 청년부 다락방

ID는 영문/숫자 권장 (한글도 가능하지만 URL에서 인코딩됨).

## Firestore 보안 규칙 (꼭 설정!)

테스트 모드는 30일 후 잠겨요. Firebase 콘솔 → Firestore Database → 규칙 탭에 아래 규칙을 붙여넣고 게시:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groups/{groupId} {
      allow read, write: if request.auth != null;

      match /members/{memberId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null
          && request.resource.data.keys().hasAll(['name', 'pinHash', 'color'])
          && request.resource.data.name is string
          && request.resource.data.name.size() > 0
          && request.resource.data.pinHash is string;
        allow update, delete: if false;
      }

      match /progress/{memberId} {
        allow read, write: if request.auth != null;
      }

      match /cheers/{cheerId} {
        allow read, create: if request.auth != null;
        allow update, delete: if false;
      }
    }
  }
}
```

## 기술 스택

- React 18 (CDN) + Babel Standalone (브라우저 내 JSX 변환)
- Firebase JS SDK v10 (Firestore + Anonymous Auth)
- Vanilla CSS 변수 기반 테마
- 빌드 도구 없음 (정적 호스팅)

## 라이선스

내부 다락방 사용 목적. 외부 공개/상업적 사용 시 별도 협의.
