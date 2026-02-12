<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
$action = isset($data['action']) ? $data['action'] : '';

if ($action === 'signup') {
    $name = $data['name'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $role = $data['role']; // 'admin', 'staff', 'reception'
    $department = $data['department'] ?? '';
    $phone = $data['phoneNumber'] ?? null;

    try {
        $stmt = $conn->prepare("INSERT INTO users (name, email, phoneNumber, password, role, department) VALUES (:name, :email, :phone, :pass, :role, :dept)");
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':pass' => $password,
            ':role' => $role,
            ':dept' => $department
        ]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email likely already exists']);
    }

} elseif ($action === 'login') {
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']); // Don't send password back
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
