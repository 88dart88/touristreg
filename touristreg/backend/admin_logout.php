<?php
// backend/admin_logout.php

// 1. Initialize the session
// We need to start it to access it, so we can destroy it.
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// 2. Unset all session variables
$_SESSION = array();

// 3. Destroy the session cookie
// This is important for security to invalidate the cookie on the browser side.
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 4. Destroy the session storage on the server
session_destroy();

// 5. Redirect to the Login Page
// Path Logic: Go UP one level (../) from 'backend', then DOWN into 'admin'
header('Location: ../admin/admin_login.html'); 
exit;
?>