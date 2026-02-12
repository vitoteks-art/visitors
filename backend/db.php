<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class Database {
    private $pdo;
    
    // cPanel MySQL Credentials (used when NOT on localhost)
    private $host = 'localhost';
    private $db_name = 'skyweb_visitor';
    private $username = 'skyweb_visitor';
    private $password = 'PQ(_dP+b0GVYqtNQ';

    public function __construct() {
        $isLocal = ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1' || strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0);

        try {
            if ($isLocal) {
                // Use SQLite for local development
                $this->pdo = new PDO('sqlite:database.sqlite');
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->initStats(); // Auto-create tables for local ease
            } else {
                // Use MySQL for cPanel/Production
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
                $this->pdo = new PDO($dsn, $this->username, $this->password);
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->pdo;
    }

    private function initStats() {
        // Table creation for SQLite (MySQL is handled via .sql import)
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS visitors (
            id TEXT PRIMARY KEY,
            fullName TEXT,
            email TEXT,
            phoneNumber TEXT,
            company TEXT,
            purpose TEXT,
            hostName TEXT,
            hostDepartment TEXT,
            photoUrl TEXT,
            signature TEXT,
            inviteCode TEXT UNIQUE,
            idType TEXT,
            idNumber TEXT,
            checkInTime TEXT,
            checkOutTime TEXT,
            approvalTime TEXT,
            badgeNumber TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $this->pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id TEXT,
            type TEXT,
            message TEXT,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        $this->pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            phoneNumber TEXT,
            password TEXT,
            role TEXT,
            department TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // Add phoneNumber column if it doesn't exist (for existing SQLite databases)
        try {
            $this->pdo->exec("ALTER TABLE users ADD COLUMN phoneNumber TEXT DEFAULT NULL");
        } catch (PDOException $e) {
            // Column probably already exists
        }
    }
}
?>
