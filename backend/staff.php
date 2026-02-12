<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    
    if ($role) {
        $stmt = $conn->prepare("SELECT id, name, email, phoneNumber, department, role FROM users WHERE role = :role ORDER BY name ASC");
        $stmt->execute([':role' => $role]);
    } else {
        $stmt = $conn->query("SELECT id, name, email, phoneNumber, department, role FROM users ORDER BY name ASC");
    }
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);

} elseif ($method === 'POST') {
    // Used for Admin creating staff
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if updating or deleting via POST (for simplicity)
    if (isset($data['action'])) {
        if ($data['action'] === 'delete') {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $data['id']]);
            echo json_encode(['success' => true]);
            exit;
        } elseif ($data['action'] === 'update') {
            $stmt = $conn->prepare("UPDATE users SET name = :name, email = :email, phoneNumber = :phone, role = :role, department = :dept WHERE id = :id");
            $stmt->execute([
                ':name' => $data['name'],
                ':email' => $data['email'],
                ':phone' => $data['phoneNumber'] ?? null,
                ':role' => $data['role'],
                ':dept' => $data['department'],
                ':id' => $data['id']
            ]);
            echo json_encode(['success' => true]);
            exit;
        }
    }

    // Default: Create New
    $stmt = $conn->prepare("INSERT INTO users (name, email, phoneNumber, password, role, department) VALUES (:name, :email, :phone, :pass, :role, :dept)");
    $stmt->execute([
        ':name' => $data['name'],
        ':email' => $data['email'],
        ':phone' => $data['phoneNumber'] ?? null,
        ':pass' => password_hash('password123', PASSWORD_DEFAULT), // Default password
        ':role' => $data['role'],
        ':dept' => $data['department']
    ]);
    
    echo json_encode(['success' => true]);
}
?>
