# LOGIC 동아리 홈페이지

Team LOGIC 공식 홈페이지 프로젝트입니다. 이 문서는 처음 합류하는 팀원도 바로 따라 할 수 있게 쓴 가이드예요.

## 팀 구성 & 권한

| 역할 | 담당 |
|---|---|
| 프론트엔드팀 | 화면(HTML/CSS/JS) 작업 |
| 백엔드팀 | API(`server/server.js`) 작업 |
| DB팀 + 팀장 | 실제 운영 DB, Cafe24 배포 담당 (실제 비밀번호/키 보유) |

**실제 운영 DB 비밀번호, `ADMIN_KEY`, Cafe24 배포용 SSH 키는 DB팀과 팀장만 갖고 있어요.** 프론트/백엔드팀은 아래 "로컬 개발 DB"로 작업하시면 되고, 실제 서버 DB 접근이 필요 없습니다 (애초에 운영 DB는 Cafe24 내부망 전용이라 밖에서 접속도 안 돼요).

## 폴더 구조

```
logic-web/
├── main/
│   ├── html/     ← 페이지 (board, dashboard, gallery, home, index, login, notice, schedule)
│   ├── css/      ← 페이지별 스타일
│   ├── js/       ← 페이지별 스크립트
│   └── assets/   ← 이미지 등
├── server/
│   ├── server.js     ← 백엔드 API 전부 여기
│   └── db/schema.sql ← DB 테이블 정의
├── web.js        ← Cafe24 배포용 진입점 (server.js를 불러오기만 함, 건드릴 일 거의 없음)
└── package.json
```

## 시작하기 (공통, 전원)

```bash
git clone https://github.com/kwmxxae/logic-web.git
cd logic-web
npm install
cp .env.example .env   # 값은 아래 역할별 가이드대로 채우기
npm start               # http://localhost:3000 에서 확인
```

---

## 프론트엔드팀

`main/html/*.html` 파일 열어서 작업하시면 돼요. `main/css/`, `main/js/`는 같은 이름의 html과 1:1로 짝지어져 있어요 (`home.html` ↔ `css/home.css` ↔ `js/home.js`).

- 서버 없이 그냥 브라우저로 html 파일을 직접 열어도 대부분 확인 가능해요.
- 로그인 페이지(`main/html/index.html`)처럼 API를 호출하는 화면을 테스트하려면 `npm start`로 서버를 띄워야 해요 (`.env`는 아래 백엔드팀 안내대로 로컬 DB로 채워두면 됨. 없어도 서버는 뜨고, DB 관련 기능만 안 될 뿐이에요).
- 새 페이지를 추가할 땐 기존 페이지(`home.html` 등) 구조를 그대로 복사해서 시작하는 걸 추천해요 (상단 네비게이션, 로그아웃 버튼 등 공통 구조가 같아요).

## 백엔드팀

API는 전부 `server/server.js` 한 파일에 있어요. 새 기능(예: 공지사항 CRUD API)을 추가할 땐 기존 `/api/login` 라우트를 참고해서 같은 패턴으로 추가하시면 됩니다.

### 로컬 개발 DB 준비 (한 번만)

실제 운영 DB는 못 쓰니, 내 컴퓨터에 MySQL을 따로 설치해서 씁니다.

```bash
# Mac (Homebrew)
brew install mysql
brew services start mysql

# DB랑 테이블 만들기
mysql -u root -e "CREATE DATABASE logic_web_dev;"
mysql -u root logic_web_dev < server/db/schema.sql
```

그 다음 `.env` 파일을 이렇게 채우세요 (`.env.example` 그대로 복사하면 됨):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=(로컬 mysql 비번, 보통 비어있음)
DB_NAME=logic_web_dev
```

`npm start` 하면 로컬 DB에 붙어서 개발할 수 있어요. 완성되면 DB팀/팀장한테 "이런 테이블/컬럼 필요해요" 하고 요청하면 실제 운영 DB에도 반영해줍니다.

### DB 구조 바꾸고 싶을 때

직접 운영 DB를 못 건드리니, `server/db/schema.sql`을 수정한 뒤 DB팀/팀장한테 반영 요청하세요.

---

## DB팀 + 팀장 전용

### 운영 DB 접속 정보

Cafe24 콘솔 → `서비스 접속관리 → 서비스 접속정보`에서 확인. 실제 값은 카톡/디스코드 같은 공개 채팅방 말고 **1:1 또는 비공개 채널로만** 공유하세요.

- DB 주소는 `10.0.0.1` (Cafe24 내부망 전용, 로컬에서 직접 접속 불가)
- **GUI로 보고 싶으면**: MySQL Workbench 등에서 Host를 `teamlogic.cafe24app.com`으로 (내부망 주소가 아니라 앱 도메인으로 접속). 단, 접속하는 사람의 공인 IP가 Cafe24에 화이트리스트로 등록돼 있어야 함 — 고정 IP(집/학교 와이파이 등)가 아니면 등록해도 소용없음(핫스팟 등 유동 IP는 매번 바뀜)
- **그래서 실무적으로는** `/admin/run-sql` API로 SQL을 실행하는 게 제일 편함 (아래 참고)

### `/admin/run-sql`로 DB 조작하기

IP 제약 없이 어디서든 SQL을 실행할 수 있는 관리용 API입니다.

```bash
curl -X POST http://teamlogic.cafe24app.com/admin/run-sql \
  -H "Content-Type: application/json" \
  -H "x-admin-key: (실제 ADMIN_KEY)" \
  -d '{"sql":"SELECT * FROM users"}'
```

`x-admin-key`가 틀리면 401로 막힙니다. **이 키가 곧 DB 접속 비밀번호와 동급이니 외부에 노출하지 마세요.**

### 배포 (Cafe24로 push)

이 저장소는 원격이 2개입니다:

| 원격 | 용도 |
|---|---|
| `origin` (GitHub) | `main` 브랜치만 사용. `.env`, `node_modules` 등 민감정보/설치파일 **제외** |
| `cafe24` | `deploy/cafe24` 브랜치 전용. 실제 배포용 `.env`(→`server/env.cafe24.json`), `node_modules`까지 **포함** |

**`deploy/cafe24` 브랜치를 `origin`(GitHub)에 절대 push하지 마세요.** 실제 DB 비밀번호가 그대로 들어있습니다.

배포 절차:
```bash
git checkout main
# ... 최신 작업 반영 확인 ...
git checkout deploy/cafe24
git merge main          # main의 최신 변경사항 가져오기 (env.cafe24.json, node_modules는 그대로 유지됨)
git add -A && git commit -m "deploy: ..."
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa -o IdentitiesOnly=yes" git push cafe24 deploy/cafe24:master
```
push 후 Cafe24 콘솔 → 앱 생성/관리 → `teamlogic` 앱 **중지 → 실행**을 눌러야 반영됩니다.

**SSH 키는 RSA만 지원됩니다.** (ED25519 키는 `Permission denied`로 거부됨 — Cafe24 인프라가 오래돼서 그런 것으로 추정)

---

## 트러블슈팅 기록 (같은 삽질 방지용)

Cafe24 node.js 호스팅(비즈니스 플랜)이 실제로는 굉장히 오래된 Node/MySQL을 돌리고 있어서 겪었던 이슈들입니다.

| 증상 | 원인 | 해결 |
|---|---|---|
| `Cannot find module 'node:buffer'` | `mysql2` 최신 버전이 요구하는 Node 버전이 Cafe24 실제 런타임보다 높음 | `mysql2`를 `3.16.0`으로 고정 (CVE 패치는 됐지만 `node:` prefix는 안 쓰는 마지막 버전) |
| `Invalid default value for 'created_at'` | 오래된 MySQL은 `DATETIME` 컬럼에 `DEFAULT CURRENT_TIMESTAMP` 사용 불가 | 컬럼 타입을 `TIMESTAMP`로 |
| `Unknown character set: 'utf8mb4'` | 오래된 MySQL이 `utf8mb4` 미지원 | `utf8`로 |
| git push 시 `Permission denied` | Cafe24가 ED25519 키를 인식 못 함 | RSA 키(`id_rsa.pub`) 등록해서 사용 |
| DB_HOST가 안 읽힘 (`ECONNREFUSED 127.0.0.1`) | Cafe24 배포가 숨김파일(`.env`)을 누락시키는 것으로 추정 | `server/env.cafe24.json`(숨김파일 아님)으로 대체 |
| Express 5 관련 에러 | Cafe24는 Node 14/12만 지원, Express 5는 Node 18+ 필요 | Express 4로 다운그레이드 |
| `node_modules`가 배포 후에도 안 바뀜 | Cafe24가 push마다 `npm install`을 재실행하지 않는 것으로 보임 | `deploy/cafe24` 브랜치에는 `node_modules`를 통째로 커밋 |
