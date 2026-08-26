# Field research on love

매주 화요일의 사랑연구회 — 웹사이트 & 참여 신청 폼.

React + Vite + Tailwind CSS 4 로 만든 정적 사이트이며, 참여 신청 폼(`/application`)을 제출하면 서버리스 함수(`api/apply.ts`)가 Notion 데이터베이스에 신청 내용을 기록합니다.

## 로컬 개발

```bash
pnpm install
pnpm dev
```

`vite dev`만으로는 `/api/apply`가 동작하지 않습니다 (Vercel 함수이기 때문). 폼 제출까지 로컬에서 확인하려면 [Vercel CLI](https://vercel.com/docs/cli)로 `vercel dev`를 사용하세요.

## Notion 연동 설정 (신청자 응답 자동 기록)

신청자 DB는 이미 Notion에 만들어 두었습니다: **[매주 화요일의 사랑연구회 신청자 DB](https://app.notion.com/p/ab4cff6782cf4bb7995be9c60aadbc01)** (TRIFE 워크스페이스 → `TRIFE 신청 링크 DB` 하위).

배포된 사이트가 이 데이터베이스에 실제로 값을 써넣으려면, 아래처럼 Notion 통합(integration) 토큰을 발급해서 서버 환경변수로 등록해야 합니다. (이 세션에서 제가 가진 Notion 연결은 저 개인 세션용이라, 배포된 서버가 대신 쓸 수 있는 별도의 토큰이 필요합니다.)

1. https://www.notion.so/my-integrations 에서 **New integration** 생성 (Internal integration, 워크스페이스: TRIFE). 생성 후 **Internal Integration Secret**을 복사해둡니다.
2. Notion에서 위 데이터베이스 페이지를 열고 우측 상단 `···` → **Connections** → 방금 만든 통합을 연결(Share)합니다. (이 단계를 빼먹으면 API가 `object_not_found` 에러를 냅니다.)
3. 배포 플랫폼(Vercel 등)의 환경변수에 아래 두 값을 등록합니다.
   - `NOTION_TOKEN` = 1번에서 복사한 Internal Integration Secret
   - `NOTION_DATABASE_ID` = `ab4cff6782cf4bb7995be9c60aadbc01`
4. 재배포하면 `/application` 폼 제출 시 `api/apply.ts`가 이 DB에 새 행을 생성합니다.

로컬에서 `vercel dev`로 테스트하려면 `.env` 파일에 같은 두 값을 넣으세요 (`.env`는 `.gitignore`에 포함되어 커밋되지 않습니다).

```
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=ab4cff6782cf4bb7995be9c60aadbc01
```

## 배포

Vercel에 이 저장소를 연결하면 정적 사이트(Vite build)와 `api/apply.ts` 서버리스 함수가 함께 배포됩니다. 다른 정적 호스팅(예: GitHub Pages)을 쓸 경우 `api/apply.ts`를 그 플랫폼의 서버리스/함수 포맷에 맞게 옮겨야 폼 제출이 동작합니다.
