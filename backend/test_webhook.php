<?php
$data = [
    'id' => 'test-' . time(),
    'fullName' => 'Test Visitor',
    'email' => 'test@example.com',
    'phoneNumber' => '123456789',
    'company' => 'Test Co',
    'purpose' => 'Meeting',
    'hostName' => 'Admin User',
    'hostDepartment' => 'IT',
    'idType' => 'Passport',
    'idNumber' => 'P123',
    'checkInTime' => date('c'),
    'status' => 'PENDING'
];

$ch = curl_init('http://localhost:8000/visitors.php');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
echo "Response: " . $res . "\n";
curl_close($ch);
?>
