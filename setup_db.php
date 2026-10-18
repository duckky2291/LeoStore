<?php
/**
 * Leo Fashion Store - Database Setup & Auto-Installer
 * Milan • Paris • New York • London
 * 
 * Run from CLI: C:\xampp\php\php.exe setup_db.php
 * Or visit in browser: http://localhost/leostore/setup_db.php
 */

header('Content-Type: text/html; charset=utf-8');

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'leostore';
$sqlFile = __DIR__ . '/database/leostore.sql';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Leo Store - Database Setup</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0d12; color: #f2f2f5; padding: 40px; margin: 0; }
        .card { max-width: 720px; margin: 0 auto; background: #14161f; border: 1px solid #2a2d3d; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #d4af37; margin-top: 0; font-size: 24px; letter-spacing: 1px; }
        .log-item { padding: 10px 14px; margin-bottom: 8px; border-radius: 6px; font-size: 14px; font-family: monospace; }
        .success { background: rgba(46, 204, 113, 0.15); border: 1px solid #2ecc71; color: #2ecc71; }
        .error { background: rgba(231, 76, 60, 0.15); border: 1px solid #e74c3c; color: #e74c3c; }
        .info { background: rgba(52, 152, 219, 0.15); border: 1px solid #3498db; color: #5dade2; }
        .actions { margin-top: 24px; display: flex; gap: 12px; }
        .btn { display: inline-block; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; cursor: pointer; }
        .btn-gold { background: linear-gradient(135deg, #eed59b, #c5a059); color: #0c0d12; border: none; }
        .btn-outline { background: transparent; border: 1px solid #454a60; color: #dcdfe8; }
    </style>
</head>
<body>
<div class="card">
    <h1>Leo Fashion Store — Database Setup</h1>
    <p style="color: #9aa0b8; margin-bottom: 24px;">Configuring MySQL Database <code>leostore</code> and tables for phpMyAdmin.</p>

<?php
try {
    // 1. Connect to MySQL server
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo '<div class="log-item success">✓ Connected to MySQL server at ' . htmlspecialchars($host) . '</div>';

    // 2. Read SQL file
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found at: $sqlFile");
    }
    $sql = file_get_contents($sqlFile);
    echo '<div class="log-item info">✓ Loaded schema file: database/leostore.sql (' . strlen($sql) . ' bytes)</div>';

    // 3. Execute multi-statement SQL
    $pdo->exec($sql);
    echo '<div class="log-item success">✓ Database `leostore` created & schema executed successfully!</div>';

    // 4. Verify counts
    $pdo->exec("USE `leostore`");
    $prodCount = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $orderCount = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    $subscriberCount = $pdo->query("SELECT COUNT(*) FROM subscribers")->fetchColumn();

    echo "<div class=\"log-item success\">✓ Verified tables in phpMyAdmin:<br>
          &nbsp;&nbsp;• <b>products:</b> $prodCount luxury designs<br>
          &nbsp;&nbsp;• <b>users:</b> $userCount accounts (Admin, Partner Seller, VIP Privé)<br>
          &nbsp;&nbsp;• <b>orders:</b> $orderCount orders seeded<br>
          &nbsp;&nbsp;• <b>subscribers:</b> $subscriberCount VIP subscribers</div>";

    echo '<div class="actions">
            <a href="index.html" class="btn btn-gold">Launch Leo Fashion Store</a>
            <a href="/phpmyadmin/index.php?route=/database/structure&db=leostore" target="_blank" class="btn btn-outline">Open in phpMyAdmin</a>
          </div>';

} catch (Exception $e) {
    echo '<div class="log-item error">✗ Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
    echo '<p style="color: #e74c3c;">Please ensure MySQL is running in XAMPP Control Panel.</p>';
}
?>
</div>
</body>
</html>
