/*
 @ Author TEAM LOGIC / 20260811 LOGIC 권민재 최종 수정
 실제 서버 내부 처리 관련 로직입니다. 백엔드 API가 여기서 동작하오니 참고바랍니다.
*/

const fs = require('fs');
const path = require('path');

// Cafe24 배포 환경에서는 숨김파일(.env)이 배포 과정에서 누락되는 것으로 보여
// 숨김파일이 아닌 server/env.cafe24.json이 있으면 그걸 우선 사용하고,
// 없으면(로컬 개발 등) 기존 방식대로 .env를 읽습니다.
const cafe24EnvPath = path.join(__dirname, 'env.cafe24.json');
if (fs.existsSync(cafe24EnvPath)) {
  Object.assign(process.env, JSON.parse(fs.readFileSync(cafe24EnvPath, 'utf8')));
  console.log('env.cafe24.json 에서 환경변수를 불러왔습니다.');
} else {
  require('dotenv').config({ quiet: true });
}

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 프론트엔드 정적 파일 서빙하는 과정입니다
app.use(express.static(path.join(__dirname, '..', 'main')));
app.get('/', (req, res) => {
  res.redirect('/html/index.html');
});

// Cafe24 MySQL DB 연동 설정하는 과정입니다. .dotenv에서 접속 정보 불러오도록 되어 있습니다.
console.log('DB_HOST =', process.env.DB_HOST, '/ DB_NAME =', process.env.DB_NAME);
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

db.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
  } else {
    console.log('MySQL 연결 성공!');
  }
});

// ⚠️ 임시 스키마 생성용 엔드포인트 (DB가 내부망 전용이라 외부 DB 클라이언트로 접속이 안 돼서 부득이하게 추가)
// 배포 후 브라우저에서 한 번만 접속해서 테이블을 만들고, 확인되면 이 라우트는 제거할 예정입니다.
app.get('/setup-db', (req, res) => {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  const setupConn = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true
  });
  setupConn.connect((connErr) => {
    if (connErr) {
      return res.status(500).json({ success: false, message: 'DB 연결 실패', error: connErr.message });
    }
    setupConn.query(schemaSql, (queryErr) => {
      setupConn.end();
      if (queryErr) {
        return res.status(500).json({ success: false, message: '스키마 실행 실패', error: queryErr.message });
      }
      res.json({ success: true, message: '스키마(users, notices, board_posts, schedules, gallery_folders, gallery_photos) 생성 완료' });
    });
  });
});

// 기본적 로그인 핸들링 로직입니다.
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: '비밀번호를 입력해주세요.' });
  }

  // users 테이블에서 입력받은 비밀번호와 일치하는 사용자 조회
  // 2학년 분들이라면 DB 강의 시간에 배운 기본적인 쿼리문입니다. SELECT문을 사용하여 users 테이블에서 password 컬럼과 일치하는 레코드를 찾습니다.
  const sql = 'SELECT user_id, student_id, real_name FROM users WHERE password = ?';
  
  db.query(sql, [password], (err, results) => {
    if (err) {
      console.error('DB 쿼리 에러:', err);
      return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' }); // server error
    }

    // DB에 일치하는 비밀번호가 존재하는 경우 핸들링 과정입니다. results 배열에 조회된 사용자 정보가 담기게 되며, 이를 통해 로그인 성공 여부를 판단합니다.
    if (results.length > 0) {
      const user = results[0];
      return res.json({
        success: true,
        message: '로그인 성공!',
        user: {
          userId: user.user_id,
          studentId: user.student_id,
          realName: user.real_name
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 올바르지 않습니다.'
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});