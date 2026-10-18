<?php
/**
 * Leo Fashion Store - Newsletter & VIP Club Subscription API
 * Milan • Paris • New York • London
 * 
 * POST /api/subscribe.php - Subscribe to VIP privileges
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);

if (!$email) {
    jsonResponse(['success' => false, 'message' => 'Please provide a valid email address.'], 400);
}

try {
    $stmt = $pdo->prepare("INSERT INTO subscribers (email) VALUES (?)");
    $stmt->execute([$email]);
    jsonResponse([
        'success' => true,
        'message' => 'Privé VIP access privilege activated for ' . $email
    ], 201);
} catch (PDOException $e) {
    // If duplicate email
    if ($e->getCode() == 23000) {
        jsonResponse([
            'success' => true,
            'message' => 'Email ' . $email . ' is already registered with Leo Privé.'
        ]);
    }
    jsonResponse(['success' => false, 'message' => 'Subscription failed: ' . $e->getMessage()], 500);
}
