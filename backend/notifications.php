<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

$lastId = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;
$role = isset($_GET['role']) ? $_GET['role'] : '';
$userName = isset($_GET['user_name']) ? $_GET['user_name'] : '';

$query = "SELECT n.*, v.fullName as visitorName, v.hostName 
          FROM notifications n 
          LEFT JOIN visitors v ON n.visitor_id = v.id 
          WHERE n.id > :lastId";

$params = [':lastId' => $lastId];

if ($role === 'staff' && !empty($userName)) {
    $query .= " AND v.hostName = :hostName";
    $params[':hostName'] = $userName;
}
// Reception and Admin see all, so no extra filters for them

$query .= " ORDER BY n.id ASC";

$stmt = $conn->prepare($query);
$stmt->execute($params);
$notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'notifications' => $notifications,
    'has_new' => count($notifications) > 0,
    'latest_id' => count($notifications) > 0 ? $notifications[count($notifications) - 1]['id'] : $lastId
]);
?>
