<?php
// backend/reset_admin.php
require_once 'db_conn.php';

// --- SETTINGS ---
$username = 'admin';
$new_password = 'admin123';
// ----------------

try {
    // 1. Encrypt the password using PHP's standard security
    $hash = password_hash($new_password, PASSWORD_DEFAULT);

    // 2. Check if the user exists
    $check = $pdo->prepare("SELECT id FROM admins WHERE username = :u");
    $check->execute([':u' => $username]);
    
    if ($check->rowCount() > 0) {
        // User exists -> UPDATE the password
        $sql = "UPDATE admins SET password = :p WHERE username = :u";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':p' => $hash, ':u' => $username]);
        echo "<h2 style='color:green'>Success! Password UPDATED.</h2>";
    } else {
        // User doesn't exist -> INSERT new user
        $sql = "INSERT INTO admins (username, password) VALUES (:u, :p)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':u' => $username, ':p' => $hash]);
        echo "<h2 style='color:green'>Success! New Admin CREATED.</h2>";
    }

    echo "<p>Username: <strong>$username</strong></p>";
    echo "<p>Password: <strong>$new_password</strong></p>";
    echo "<br><a href='../admin/admin_login.html'>Go to Login Page</a>";

} catch (PDOException $e) {
    echo "<h2 style='color:red'>Database Error</h2>";
    echo $e->getMessage();
}
?>