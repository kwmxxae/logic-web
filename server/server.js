const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // HTML에서 API 접근을 허용하기 위한 CORS 설정
app.use(express.json());

// MySQL Workbench에서 확인/설정한 DB 정보 입력
const db = mysql.createConnection({
  host: 'sakura.proxy.rlwy.net',
  port: 46427, // 👈 [필수] Railway 외부 포트 추가!
  user: 'test01',
  password: 'test1234',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false // 👈 [필수] Railway SSL 접속 허용 설정!
  }
});

db.connect((err) => {
  if (err) console.error('DB 연결 실패:', err);
  else console.log('MySQL 연결 성공!');
});

// HTML에서 데이터 요청할 API 엔드포인트
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 내 백엔드 서버 실행 포트 (46427 대신 3000 사용)
app.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});