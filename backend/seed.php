<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

$users = [
    [
        'name' => 'Admin User',
        'email' => 'admin@gatekeeper.com',
        'password' => 'admin123',
        'role' => 'admin',
        'dept' => 'IT'
    ],
    [
        'name' => 'Reception User',
        'email' => 'reception@gatekeeper.com',
        'password' => 'reception123',
        'role' => 'reception',
        'dept' => 'Front Desk'
    ],
    [
        'name' => 'John Host',
        'email' => 'john@gatekeeper.com',
        'password' => 'host123',
        'role' => 'staff',
        'dept' => 'Sales'
    ]
];

foreach ($users as $u) {
    try {
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, department) VALUES (:name, :email, :pass, :role, :dept)");
        $stmt->execute([
            ':name' => $u['name'],
            ':email' => $u['email'],
            ':pass' => password_hash($u['password'], PASSWORD_DEFAULT),
            ':role' => $u['role'],
            ':dept' => $u['dept']
        ]);
        echo "Created user: {$u['name']} ({$u['role']})\n";
    } catch (PDOException $e) {
        echo "User already exists: {$u['name']}\n";
    }
}
?>
