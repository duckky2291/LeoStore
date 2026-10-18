<?php
/**
 * Leo Fashion Store - Orders API
 * Milan • Paris • New York • London
 * 
 * GET  /api/orders.php                    - List orders (admin or by customer_id)
 * POST /api/orders.php                    - Create a new order
 * PUT  /api/orders.php                    - Update order status
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatOrder($row) {
    if (!$row) return null;
    $row['total'] = (float)$row['total'];
    $row['items'] = json_decode($row['items'], true) ?: [];
    $row['customer'] = [
        'name' => $row['customer_name'],
        'phone' => $row['customer_phone'],
        'email' => $row['customer_email'],
        'address' => $row['customer_address'],
        'notes' => $row['delivery_notes']
    ];
    return $row;
}

if ($method === 'GET') {
    $customerId = $_GET['customer_id'] ?? null;
    $orderId = $_GET['id'] ?? null;

    if ($orderId) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        if ($order) {
            jsonResponse(['success' => true, 'order' => formatOrder($order)]);
        } else {
            jsonResponse(['success' => false, 'message' => 'Order not found'], 404);
        }
    }

    if ($customerId) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC");
        $stmt->execute([$customerId]);
    } else {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
    }

    $rows = $stmt->fetchAll();
    $orders = array_map('formatOrder', $rows);

    jsonResponse([
        'success' => true,
        'count' => count($orders),
        'orders' => $orders
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $customerName = trim($input['customer']['name'] ?? $input['customer_name'] ?? '');
    $customerPhone = trim($input['customer']['phone'] ?? $input['customer_phone'] ?? '');
    $customerEmail = trim($input['customer']['email'] ?? $input['customer_email'] ?? '');
    $customerAddress = trim($input['customer']['address'] ?? $input['customer_address'] ?? '');
    $deliveryNotes = trim($input['customer']['notes'] ?? $input['delivery_notes'] ?? '');
    $paymentMethod = $input['paymentMethod'] ?? $input['payment_method'] ?? 'card';
    $total = (float)($input['total'] ?? 0);
    $currency = $input['currency'] ?? 'USD';
    $items = is_array($input['items'] ?? null) ? json_encode($input['items']) : '[]';
    $customerId = $input['customerId'] ?? $input['customer_id'] ?? 'GUEST';

    if (empty($customerName) || empty($customerPhone) || empty($customerAddress)) {
        jsonResponse([
            'success' => false,
            'message' => 'Customer Name, Phone, and Delivery Address are required.'
        ], 400);
    }

    $orderId = 'LEO-' . date('Y') . '-' . str_pad(mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO orders 
        (order_id, customer_id, customer_name, customer_phone, customer_email, customer_address, delivery_notes, payment_method, status, total, currency, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    ");

    $stmt->execute([
        $orderId, $customerId, $customerName, $customerPhone, $customerEmail,
        $customerAddress, $deliveryNotes, $paymentMethod, $total, $currency, $items
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Order placed successfully',
        'orderId' => $orderId,
        'order' => [
            'orderId' => $orderId,
            'customer' => [
                'name' => $customerName,
                'phone' => $customerPhone,
                'email' => $customerEmail,
                'address' => $customerAddress,
                'notes' => $deliveryNotes
            ],
            'paymentMethod' => $paymentMethod,
            'total' => $total,
            'currency' => $currency,
            'status' => 'pending'
        ]
    ], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $orderId = $input['orderId'] ?? $input['order_id'] ?? $_GET['id'] ?? null;
    $status = $input['status'] ?? null;

    $validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'cancelled'];

    if (!$orderId || !$status || !in_array($status, $validStatuses)) {
        jsonResponse([
            'success' => false,
            'message' => 'Valid Order ID and Status (' . implode(', ', $validStatuses) . ') required.'
        ], 400);
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
    $stmt->execute([$status, $orderId]);

    jsonResponse([
        'success' => true,
        'message' => "Order #$orderId updated to status: $status",
        'orderId' => $orderId,
        'status' => $status
    ]);
}

jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
