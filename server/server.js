const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Railway 클라우드 DB 연동 설정 (본인 DB 접속 정보 입력)
const db = mysql.createConnection({
  host: 'sakura.proxy.rlwy.net',
  port: 46427,
  user: 'test01',
  password: 'test1234',
  database: 'logic-web',
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
  } else {
    console.log('MySQL 연결 성공!');
  }
});

// 🔐 DB 스키마 맞춤 로그인 API
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: '비밀번호를 입력해주세요.' });
  }

  // users 테이블에서 입력받은 비밀번호와 일치하는 사용자 조회
  const sql = 'SELECT user_id, student_id, real_name FROM users WHERE password = ?';
  
  db.query(sql, [password], (err, results) => {
    if (err) {
      console.error('DB 쿼리 에러:', err);
      return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
    }

    // DB에 일치하는 비밀번호가 존재하는 경우
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
      // 일치하는 비밀번호가 없는 경우
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