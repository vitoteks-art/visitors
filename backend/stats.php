<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

// Get simple stats for today
$today = date('Y-m-d') . '%'; // SQLite default date format in YYYY-MM-DD for simpler query if using DATE function, but we stored ISO strings. 
// However, exact ISO string comparison is tricky. Let's do it in PHP to be safe with the mixed ISO formats or use substr.

$stmt = $conn->query("SELECT * FROM visitors");
$allVisitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

$currentDateStart = strtotime('today 00:00:00');
$currentDateEnd = strtotime('tomorrow 00:00:00') - 1;

foreach ($allVisitors as $v) {
    // Parse checkInTime (handles ISO 8601 automatically)
    $visitorTime = strtotime($v['checkInTime']);
    
    if ($visitorTime >= $currentDateStart && $visitorTime <= $currentDateEnd) {
        $todayVisitors[] = $v;
    }
}

$stats = [
    'total' => count($todayVisitors),
    'pending' => 0,
    'approved' => 0,
    'declined' => 0,
    'checkedOut' => 0
];

foreach ($todayVisitors as $v) {
    if ($v['status'] === 'PENDING') $stats['pending']++;
    if ($v['status'] === 'APPROVED') $stats['approved']++;
    if ($v['status'] === 'DECLINED') $stats['declined']++;
    if ($v['status'] === 'CHECKED_OUT') $stats['checkedOut']++;
}

echo json_encode($stats);
?>
