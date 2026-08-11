-- ============================================================
-- Team LOGIC 동아리 홈페이지 DB 스키마
-- Cafe24 node.js 호스팅의 MySQL(5.x)에서 실행하세요.
-- 사용법: Cafe24 DB 관리 도구(phpMyAdmin 등) 또는
--        mysql -h <host> -P 3306 -u <user> -p <dbname> < schema.sql
-- ============================================================

-- 1) 로그인 사용자
-- server/server.js의 POST /api/login 이 이 테이블을 조회합니다.
CREATE TABLE IF NOT EXISTS users (
  user_id     INT AUTO_INCREMENT PRIMARY KEY,
  student_id  VARCHAR(20)  NOT NULL UNIQUE COMMENT '학번',
  real_name   VARCHAR(50)  NOT NULL COMMENT '이름',
  password    VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시 저장 권장)',
  role        ENUM('member','officer','admin') NOT NULL DEFAULT 'member',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) 공지사항 (main/js/notice.js 의 in-memory 배열을 대체할 테이블)
CREATE TABLE IF NOT EXISTS notices (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  author_name VARCHAR(50)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) 자유게시판 (main/js/board.js 대체)
CREATE TABLE IF NOT EXISTS board_posts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  author_name VARCHAR(50)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) 활동 일정 (main/js/schedule.js 대체)
CREATE TABLE IF NOT EXISTS schedules (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  event_date  DATE NOT NULL,
  title       VARCHAR(200) NOT NULL,
  info        VARCHAR(300) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) 사진첩 폴더 (main/js/gallery.js 대체)
CREATE TABLE IF NOT EXISTS gallery_folders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  event_date  DATE NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) 사진첩 사진
-- 사진 파일 자체는 DB가 아니라 서버 디스크(/server/uploads 등)에 저장하고
-- 이 테이블에는 파일 경로(image_path)만 저장하는 방식을 권장합니다.
-- (base64를 DB 컬럼에 직접 저장하면 용량/성능이 급격히 나빠집니다.)
CREATE TABLE IF NOT EXISTS gallery_photos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  folder_id   INT NOT NULL,
  image_path  VARCHAR(500) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES gallery_folders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
