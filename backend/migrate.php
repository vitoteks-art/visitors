<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

try {
    $conn->exec("ALTER TABLE visitors ADD COLUMN signature TEXT");
    echo "Added signature column.\n";
} catch (Exception $e) {
    echo "Signature column might already exist.\n";
}

try {
    $conn->exec("ALTER TABLE visitors ADD COLUMN inviteCode TEXT");
    $conn->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_inviteCode ON visitors(inviteCode)");
    echo "Added inviteCode column and index.\n";
} catch (Exception $e) {
    echo "InviteCode column might already exist.\n";
}

echo "Migration complete.\n";
?>
