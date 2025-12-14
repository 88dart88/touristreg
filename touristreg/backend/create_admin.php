<?php
// backend/create_admin.php
require_once 'db_conn.php';

// --- CONFIGURATION ---
$new_username = 'registra'; // Change this
$new_password = 'password123'; // Change this
// ---------------------

try {
    // 1. Hash the password
    $hash = password_hash($new_password, PASSWORD_DEFAULT);

    // 2. Insert into DB
    $sql = "INSERT INTO admins (username, password) VALUES (:u, :p)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':u' => $new_username, ':p' => $hash]);

    echo "Success! Created admin user: <strong>$new_username</strong>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>