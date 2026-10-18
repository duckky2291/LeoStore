<?php
/**
 * Leo Fashion Store - Products API
 * Milan • Paris • New York • London
 * 
 * GET    /api/products.php               - List all products
 * GET    /api/products.php?id=LEO-001    - Get single product
 * POST   /api/products.php               - Create new product
 * DELETE /api/products.php?id=LEO-001    - Delete product
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to decode JSON fields in product row
function formatProduct($row) {
    if (!$row) return null;
    $row['price'] = (float)$row['price'];
    $row['originalPrice'] = $row['original_price'] ? (float)$row['original_price'] : null;
    $row['rating'] = (float)$row['rating'];
    $row['reviewCount'] = (int)$row['review_count'];
    $row['isFeatured'] = (bool)$row['is_featured'];
    $row['isLookbook'] = (bool)$row['is_lookbook'];
    $row['inStock'] = (int)$row['in_stock'];
    
    if ($row['is_lookbook'] && $row['lookbook_x'] !== null) {
        $row['lookbookCoords'] = [
            'x' => (int)$row['lookbook_x'],
            'y' => (int)$row['lookbook_y']
        ];
    }
    
    $row['images'] = json_decode($row['images'], true) ?: [];
    $row['sizes'] = json_decode($row['sizes'], true) ?: [];
    $row['colors'] = json_decode($row['colors'], true) ?: [];
    $row['shortDesc'] = $row['short_desc'];
    $row['fabricDetail'] = $row['fabric_detail'];

    unset($row['original_price'], $row['review_count'], $row['is_featured'], 
          $row['is_lookbook'], $row['lookbook_x'], $row['lookbook_y'], 
          $row['short_desc'], $row['fabric_detail']);

    return $row;
}

if ($method === 'GET') {
    // Single product
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $prod = $stmt->fetch();
        if ($prod) {
            jsonResponse(['success' => true, 'product' => formatProduct($prod)]);
        } else {
            jsonResponse(['success' => false, 'message' => 'Product not found'], 404);
        }
    }

    // List products
    $category = $_GET['category'] ?? 'all';
    $sort = $_GET['sort'] ?? 'featured';
    $search = $_GET['q'] ?? '';

    $where = [];
    $params = [];

    if ($category !== 'all') {
        if ($category === 'runway') {
            $where[] = "collection = 'runway'";
        } elseif ($category === 'autumn') {
            $where[] = "collection = 'autumn-winter'";
        } else {
            $where[] = "category = ?";
            $params[] = $category;
        }
    }

    if (!empty($search)) {
        $where[] = "(name LIKE ? OR short_desc LIKE ? OR fabric_detail LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $orderBy = "is_featured DESC, id ASC";
    if ($sort === 'price-asc') {
        $orderBy = "price ASC";
    } elseif ($sort === 'price-desc') {
        $orderBy = "price DESC";
    } elseif ($sort === 'rating') {
        $orderBy = "rating DESC";
    }

    $sql = "SELECT * FROM products $whereClause ORDER BY $orderBy";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $products = array_map('formatProduct', $rows);
    jsonResponse([
        'success' => true,
        'count' => count($products),
        'products' => $products
    ]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    if (empty($input['name']) || empty($input['price'])) {
        jsonResponse(['success' => false, 'message' => 'Name and Price are required'], 400);
    }

    $id = !empty($input['id']) ? $input['id'] : 'LEO-' . strtoupper(substr(uniqid(), -6));
    $name = trim($input['name']);
    $category = $input['category'] ?? 'men';
    $collection = $input['collection'] ?? 'bespoke';
    $price = (float)$input['price'];
    $originalPrice = !empty($input['originalPrice']) ? (float)$input['originalPrice'] : round($price * 1.15, 2);
    $badge = !empty($input['badge']) ? trim($input['badge']) : 'New Arrival';
    $images = is_array($input['images'] ?? null) ? json_encode($input['images']) : json_encode([$input['image'] ?? 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85']);
    $sizes = is_array($input['sizes'] ?? null) ? json_encode($input['sizes']) : json_encode(["S", "M", "L", "XL"]);
    $colors = is_array($input['colors'] ?? null) ? json_encode($input['colors']) : json_encode([["name" => "Classic Black", "hex" => "#111111"]]);
    $shortDesc = trim($input['shortDesc'] ?? ($input['name'] . ' crafted from fine European fabrics.'));
    $fabricDetail = trim($input['fabricDetail'] ?? 'Premium handcrafted luxury tailoring.');
    $inStock = isset($input['inStock']) ? (int)$input['inStock'] : 10;

    $stmt = $pdo->prepare("
        INSERT INTO products 
        (id, name, category, collection, price, original_price, badge, rating, review_count, is_featured, is_lookbook, images, sizes, colors, short_desc, fabric_detail, in_stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, 1, 0, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $id, $name, $category, $collection, $price, $originalPrice, $badge,
        $images, $sizes, $colors, $shortDesc, $fabricDetail, $inStock
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Product successfully added',
        'id' => $id
    ], 201);
}

if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $id = $input['id'] ?? null;
    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Product ID is required for update'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        jsonResponse(['success' => false, 'message' => 'Product not found'], 404);
    }

    $name = !empty($input['name']) ? trim($input['name']) : $existing['name'];
    $category = $input['category'] ?? $existing['category'];
    $collection = $input['collection'] ?? $existing['collection'];
    $price = isset($input['price']) ? (float)$input['price'] : (float)$existing['price'];
    $originalPrice = !empty($input['originalPrice']) ? (float)$input['originalPrice'] : (float)$existing['original_price'];
    $badge = isset($input['badge']) ? trim($input['badge']) : $existing['badge'];
    $inStock = isset($input['inStock']) ? (int)$input['inStock'] : (int)$existing['in_stock'];
    $shortDesc = isset($input['shortDesc']) ? trim($input['shortDesc']) : $existing['short_desc'];
    $fabricDetail = isset($input['fabricDetail']) ? trim($input['fabricDetail']) : $existing['fabric_detail'];

    $images = isset($input['images']) && is_array($input['images'])
        ? json_encode($input['images'])
        : $existing['images'];

    $sizes = isset($input['sizes']) && is_array($input['sizes'])
        ? json_encode($input['sizes'])
        : $existing['sizes'];

    $colors = isset($input['colors']) && is_array($input['colors'])
        ? json_encode($input['colors'])
        : $existing['colors'];

    $updateStmt = $pdo->prepare("
        UPDATE products SET
            name = ?,
            category = ?,
            collection = ?,
            price = ?,
            original_price = ?,
            badge = ?,
            in_stock = ?,
            short_desc = ?,
            fabric_detail = ?,
            images = ?,
            sizes = ?,
            colors = ?
        WHERE id = ?
    ");

    $updateStmt->execute([
        $name, $category, $collection, $price, $originalPrice, $badge,
        $inStock, $shortDesc, $fabricDetail, $images, $sizes, $colors, $id
    ]);

    jsonResponse([
        'success' => true,
        'message' => "Product $id updated successfully",
        'id' => $id
    ]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        jsonResponse(['success' => false, 'message' => 'Product ID is required'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    jsonResponse([
        'success' => true,
        'message' => "Product $id deleted successfully"
    ]);
}

jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
