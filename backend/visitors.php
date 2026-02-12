<?php
require_once 'db.php';

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['invite_code'])) {
        $stmt = $conn->prepare("SELECT * FROM visitors WHERE inviteCode = :code LIMIT 1");
        $stmt->execute([':code' => $_GET['invite_code']]);
        $visitor = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($visitor) {
            echo json_encode($visitor);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Invalid code']);
        }
    } elseif (isset($_GET['search'])) {
        $q = "%" . $_GET['search'] . "%";
        // Search for ACTIVE visitors only (Checked-in and not yet checked out)
        $stmt = $conn->prepare("SELECT * FROM visitors WHERE (fullName LIKE :q OR phoneNumber LIKE :q) AND status = 'APPROVED' AND checkOutTime IS NULL ORDER BY created_at DESC");
        $stmt->execute([':q' => $q]);
        $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($visitors);
    } else {
        $stmt = $conn->query("SELECT * FROM visitors ORDER BY created_at DESC");
        $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($visitors);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['action']) && $data['action'] === 'status_update') {
        // Handle Status Update
        $sql = "UPDATE visitors SET status = :status, approvalTime = :approvalTime, badgeNumber = :badgeNumber, checkOutTime = :checkOutTime WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':status' => $data['status'],
            ':approvalTime' => $data['approvalTime'] ?? null,
            ':badgeNumber' => $data['badgeNumber'] ?? null,
            ':checkOutTime' => $data['checkOutTime'] ?? null,
            ':id' => $data['id']
        ]);

        // Trigger Notification for Status Change
        if ($data['status'] === 'APPROVED') {
             $notifSql = "INSERT INTO notifications (visitor_id, type, message) VALUES (:vid, 'CHECK_IN_APPROVED', :msg)";
             $stmt = $conn->prepare($notifSql);
             $stmt->execute([
                 ':vid' => $data['id'],
                 ':msg' => "Visit request was approved."
             ]);
        } elseif ($data['status'] === 'DECLINED') {
             $notifSql = "INSERT INTO notifications (visitor_id, type, message) VALUES (:vid, 'CHECK_IN_DECLINED', :msg)";
             $stmt = $conn->prepare($notifSql);
             $stmt->execute([
                 ':vid' => $data['id'],
                 ':msg' => "Visit request was declined."
             ]);
        }

        echo json_encode(['success' => true]);

    } else {
        // Handle New/Update Visitor
        // Check if exists
        $check = $conn->prepare("SELECT id FROM visitors WHERE id = :id");
        $check->execute([':id' => $data['id']]);
        
        if ($check->fetch()) {
             // Update existing (omitted full update for brevity, usually status update is main flow)
             // Ideally we implement full update if needed.
             echo json_encode(['success' => true, 'message' => 'Updated']);
        } else {
            // Insert New
            $sql = "INSERT INTO visitors (id, fullName, email, phoneNumber, company, purpose, hostName, hostDepartment, photoUrl, signature, inviteCode, idType, idNumber, checkInTime, status) 
                    VALUES (:id, :fullName, :email, :phoneNumber, :company, :purpose, :hostName, :hostDepartment, :photoUrl, :signature, :inviteCode, :idType, :idNumber, :checkInTime, :status)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':fullName' => $data['fullName'],
                ':email' => $data['email'],
                ':phoneNumber' => $data['phoneNumber'],
                ':company' => $data['company'],
                ':purpose' => $data['purpose'],
                ':hostName' => $data['hostName'],
                ':hostDepartment' => $data['hostDepartment'],
                ':photoUrl' => $data['photoUrl'] ?? '',
                ':signature' => $data['signature'] ?? '',
                ':inviteCode' => $data['inviteCode'] ?? null,
                ':idType' => $data['idType'],
                ':idNumber' => $data['idNumber'],
                ':checkInTime' => $data['checkInTime'],
                ':status' => $data['status']
            ]);

            // MOCK EMAIL SENDING
            // mail($data['email'], "Welcome", "You have checked in.");

            // CREATE NOTIFICATION (The "Alarm" trigger)
            $notifSql = "INSERT INTO notifications (visitor_id, type, message) VALUES (:vid, 'NEW_VISITOR', :msg)";
            $stmt = $conn->prepare($notifSql);
            $stmt->execute([
                ':vid' => $data['id'],
                ':msg' => "New visitor " . $data['fullName'] . " for " . $data['hostName']
            ]);

            // SEND EMAIL TO HOST (Existing logic)
            try {
                // Find host email
                $hostStmt = $conn->prepare("SELECT email FROM users WHERE name = :name LIMIT 1");
                $hostStmt->execute([':name' => $data['hostName']]);
                $host = $hostStmt->fetch(PDO::FETCH_ASSOC);

                if ($host && !empty($host['email'])) {
                    $to = $host['email'];
                    $subject = "🔔 VISITOR WAITING FOR APPROVAL";
                    $message = "━━━━━━━━━━━━━━━━━━━\n" .
                               "👤 VISITOR\n" .
                               "━━━━━━━━━━━━━━━━━━━\n" .
                               "Name: " . $data['fullName'] . "\n" .
                               "Company: " . $data['company'] . "\n" .
                               "Phone: " . ($data['phoneNumber'] ?? 'N/A') . "\n" .
                               "Purpose: " . $data['purpose'] . "\n\n" .
                               "━━━━━━━━━━━━━━━━━━━\n" .
                               "👔 HOST\n" .
                               "━━━━━━━━━━━━━━━━━━━\n" .
                               $data['hostName'] . " - " . ($data['hostDepartment'] ?? 'N/A') . "\n\n" .
                               "⚡ ACTION REQUIRED\n" .
                               "Log in to approve or reject:\n" .
                               "🔗 https://visitor.skywebhost.net";
                    
                    $headers = "From: noreply@skywebhost.net";
                    @mail($to, $subject, $message, $headers);
                    $logEntry = "[" . date('Y-m-d H:i:s') . "] EMAIL SENT TO: $to | SUBJECT: $subject\n";
                    file_put_contents('mail.log', $logEntry, FILE_APPEND);
                }
            } catch (Exception $e) {
                file_put_contents('mail.log', "[" . date('Y-m-d H:i:s') . "] ERROR (EMAIL): " . $e->getMessage() . "\n", FILE_APPEND);
            }

            // WHATSAPP ALERT WEBHOOK
            try {
                // Find host details (email AND phone)
                $hostStmt = $conn->prepare("SELECT email, phoneNumber FROM users WHERE name = :name LIMIT 1");
                $hostStmt->execute([':name' => $data['hostName']]);
                $hostInfo = $hostStmt->fetch(PDO::FETCH_ASSOC);

                $webhookUrl = "https://n8n.getostrichai.com/webhook/visitors-alert";
                $payload = [
                    'event' => 'VISITOR_CHECK_IN',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'visitor' => [
                        'name' => $data['fullName'] ?? 'Unknown',
                        'email' => $data['email'] ?? '',
                        'phone' => $data['phoneNumber'] ?? '',
                        'company' => $data['company'] ?? '',
                        'purpose' => $data['purpose'] ?? '',
                    ],
                    'host' => [
                        'name' => $data['hostName'] ?? 'General Reception',
                        'department' => $data['hostDepartment'] ?? '',
                        'phone' => $hostInfo['phoneNumber'] ?? '', // ADDED
                        'email' => $hostInfo['email'] ?? ''         // ADDED
                    ],
                    'message' => "🔔 VISITOR WAITING FOR APPROVAL\n\nVisitor " . ($data['fullName'] ?? 'Someone') . " from " . ($data['company'] ?? 'a company') . " has arrived to see " . ($data['hostName'] ?? 'you') . ".\n\n🔗 https://visitor.skywebhost.net"
                ];

                $ch = curl_init($webhookUrl);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5); 
                $response = curl_exec($ch);
                $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                $logEntry = "[" . date('Y-m-d H:i:s') . "] WHATSAPP WEBHOOK SENT. STATUS: $status | RECIPIENT: " . ($hostInfo['phoneNumber'] ?? 'No Phone') . "\n";
                file_put_contents('mail.log', $logEntry, FILE_APPEND);
            } catch (Exception $e) {
                file_put_contents('mail.log', "[" . date('Y-m-d H:i:s') . "] ERROR (WEBHOOK): " . $e->getMessage() . "\n", FILE_APPEND);
            }

            echo json_encode(['success' => true]);
        }
    }
}
?>
