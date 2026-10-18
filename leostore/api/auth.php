<?php
/**
 * Leo Fashion Store - Authentication & User Profile API
 * Milan • Paris • New York • London
 * 
 * POST /api/auth.php?action=login        - Authenticate user
 * POST /api/auth.php?action=register     - Register new account
 * POST /api/auth.php?action=measurements - Update bespoke body measurements
 * GET  /api/auth.php?action=users        - List users (Admin only)
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'login';
$method = $_SERVER['REQUEST_METHOD'];

function formatUser($row) {
    if (!$row) return null;
    unset($row['password']);
    $row['measurements'] = !empty($row['measurements']) ? json_decode($row['measurements'], true) : null;
    $row['points'] = (int)($row['points'] ?? 0);
    $row['badgeLabel'] = $row['badge_label'] ?? 'Leo Member';
    unset($row['badge_label']);
    return $row;
}

if ($action === 'login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Email and password are required.'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || $user['password'] !== $password) {
        jsonResponse(['success' => false, 'message' => 'Invalid email credentials or password.'], 401);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Welcome back, ' . $user['name'],
        'user' => formatUser($user)
    ]);
}

if ($action === 'register' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');
    $role = $input['role'] ?? 'customer';
    $phone = trim($input['phone'] ?? '');

    if (empty($name) || empty($email) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Name, Email, and Password are required.'], 400);
    }

    // Check existing
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'An account with this email address already exists.'], 409);
    }

    $id = 'USR-' . strtoupper($role) . '-' . str_pad(mt_rand(10, 99), 2, '0', STR_PAD_LEFT);
    $badgeLabel = $role === 'admin' ? 'Super Admin' : ($role === 'seller' ? 'Atelier Partner' : 'VIP Privé Member');
    $title = $role === 'admin' ? 'System Administrator' : ($role === 'seller' ? 'Partner Designer' : 'Private Client');

    $stmt = $pdo->prepare("
        INSERT INTO users (id, name, email, password, role, badge_label, title, points, phone, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1000, ?, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')
    ");
    $stmt->execute([$id, $name, $email, $password, $role, $badgeLabel, $title, $phone]);

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $newUser = $stmt->fetch();

    jsonResponse([
        'success' => true,
        'message' => 'Account successfully registered.',
        'user' => formatUser($newUser)
    ], 201);
}

if ($action === 'measurements' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $userId = $input['userId'] ?? null;
    $measurements = $input['measurements'] ?? null;

    if (!$userId || !$measurements) {
        jsonResponse(['success' => false, 'message' => 'User ID and measurements object are required.'], 400);
    }

    $stmt = $pdo->prepare("UPDATE users SET measurements = ? WHERE id = ?");
    $stmt->execute([json_encode($measurements), $userId]);

    jsonResponse([
        'success' => true,
        'message' => 'Bespoke measurements saved successfully.'
    ]);
}

if ($action === 'users' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at ASC");
    $rows = $stmt->fetchAll();
    jsonResponse([
        'success' => true,
        'users' => array_map('formatUser', $rows)
    ]);
}

jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
