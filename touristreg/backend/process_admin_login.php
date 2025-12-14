<?php
// backend/process_admin_login.php
session_start();
require_once 'db_conn.php'; 
header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unexpected error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $response['message'] = 'Username and password are required.';
    } else {
        try {
            $sql = "SELECT id, username, password FROM admins WHERE username = :username LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->execute();
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($admin && password_verify($password, $admin['password'])) {
                session_regenerate_id(true);
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_id'] = $admin['id'];
                $_SESSION['admin_username'] = $admin['username'];
                $response['success'] = true;
                $response['message'] = 'Login successful!';
            } else {
                $response['message'] = 'Invalid username or password.';
            }
        } catch (PDOException $e) {
            error_log("Login Error: " . $e->getMessage());
            $response['message'] = 'Database error.';
        }
    }
} else {
    $response['message'] = 'Invalid request method.';
}
echo json_encode($response);
exit;
?>