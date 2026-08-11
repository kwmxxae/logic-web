/*
 @ Author TEAM LOGIC / 20260811 LOGIC 권민재 최종 수정
 실제 서버 내부 처리 관련 로직입니다. 백엔드 API가 여기서 동작하오니 참고바랍니다.
*/

require('dotenv').config({ quiet: true });

const path = require('path');
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