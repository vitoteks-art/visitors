<?php
$pdo = new PDO('sqlite:database.sqlite');
$output = "";
$tables_stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
while ($row = $tables_stmt->fetch()) {
    $output .= "Table found: " . $row[0] . "\n";
}

$stmt = $pdo->query("SELECT * FROM users");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
$output .= "--- USER DETAILS ---\n";
foreach($results as $r) {
    $output .= "ID: " . $r['id'] . "\n";
    $output .= "Name: " . $r['name'] . "\n";
    $output .= "Email: " . $r['email'] . "\n";
    $output .= "-------------------\n";
}
file_put_contents('debug_users.txt', $output);
echo "Done! Check debug_users.txt\n";

?>
