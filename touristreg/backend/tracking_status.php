<?php
// backend/check_status.php

header('Content-Type: application/json');

// Ensure database connection
require_once('db_conn.php');

// 1. Helper Function for JSON Responses
function sendJsonResponse($status, $message, $data = null) {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// 2. Input Sanitization
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// 3. Validation
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse('error', 'Invalid Request Method. Use GET.');
}

if (!isset($_GET['ref']) || empty(trim($_GET['ref']))) {
    sendJsonResponse('error', 'Reference Number is required.');
}

$ref = sanitize($_GET['ref']);

// 4. Database Query
try {
    if (!isset($pdo)) {
        throw new Exception("Database connection not established.");
    }

    // Select fields from the 'registrations' table (Tourist System)
    $sql = "SELECT 
                reference_number,
                first_name,
                last_name,
                registration_type,  
                status,
                created_at,          
                rejection_reason     -- This replaces 'comments'
            FROM registrations 
            WHERE reference_number = :ref
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':ref', $ref, PDO::PARAM_STR);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // Success: Found the tourist
        sendJsonResponse('success', 'Status found.', $result);
    } else {
        // Failure: Typo or invalid number
        sendJsonResponse('error', 'Reference Number not found. Please check and try again.');
    }

} catch (Exception $e) {
    error_log("Tracking Error: " . $e->getMessage());
    sendJsonResponse('error', 'A system error occurred. Please try again later.');
}
?>