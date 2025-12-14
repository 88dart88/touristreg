<?php
// backend/admin_api.php

// --- DEBUGGING (Remove in production) ---
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// Ensure only admins can access this API
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
    exit;
}

require_once('db_conn.php');

// --- Helper: Send JSON ---
function sendJsonResponse($success, $message, $data = null, $code = 200) {
    if (!headers_sent()) header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit;
}

// --- Helper: Sanitize ---
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// --- ROUTER ---
$action = '';
$requestData = [];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = isset($_GET['action']) ? sanitize($_GET['action']) : '';
    $requestData = $_GET;
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = isset($input['action']) ? sanitize($input['action']) : '';
    $requestData = $input;
}

if (!$action) {
    sendJsonResponse(false, 'No action specified.', null, 400);
}

try {
    switch ($action) {
        case 'get_registrations':
            handle_get_registrations($pdo, $requestData);
            break;
        case 'get_details':
            handle_get_details($pdo, $requestData);
            break;
        case 'update_status':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJsonResponse(false, 'POST required.', null, 405);
            handle_update_status($pdo, $requestData);
            break;
        case 'delete_enrollment': // Renaming to delete_registration would be cleaner, but keeping for compatibility
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJsonResponse(false, 'POST required.', null, 405);
            handle_delete_registration($pdo, $requestData);
            break;
        case 'get_summary':
            handle_get_summary($pdo);
            break;
        default:
            sendJsonResponse(false, 'Invalid action: ' . $action, null, 400);
    }
} catch (PDOException $e) {
    // Show specific SQL error for debugging
    sendJsonResponse(false, 'SQL Error: ' . $e->getMessage(), null, 500);
} catch (Exception $e) {
    sendJsonResponse(false, $e->getMessage(), null, 500);
}

// --- HANDLERS ---

function handle_get_registrations($pdo, $data) {
    $status = isset($data['status']) ? sanitize($data['status']) : 'all';
    $search = isset($data['search']) ? sanitize($data['search']) : ''; // ADDED: Search Param
    $page = isset($data['page']) ? (int)$data['page'] : 1;
    $limit = isset($data['limit']) ? (int)$data['limit'] : 10;
    $offset = ($page - 1) * $limit;

    $whereClauses = [];
    $params = [];

    // Filter by Status
    if ($status !== 'all') {
        $whereClauses[] = "status = :status";
        $params[':status'] = $status;
    }

    // ADDED: Filter by Search (Name or Reference)
    // Uses unique placeholders :s1, :s2, :s3 to avoid PDO errors
    if (!empty($search)) {
        $whereClauses[] = "(reference_number LIKE :s1 OR first_name LIKE :s2 OR last_name LIKE :s3)";
        $searchTerm = "%$search%";
        $params[':s1'] = $searchTerm;
        $params[':s2'] = $searchTerm;
        $params[':s3'] = $searchTerm;
    }

    // Build Where SQL
    $whereSQL = "";
    if (count($whereClauses) > 0) {
        $whereSQL = "WHERE " . implode(" AND ", $whereClauses);
    }

    // Count Total
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM registrations $whereSQL");
    foreach ($params as $key => $val) {
        $countStmt->bindValue($key, $val);
    }
    $countStmt->execute();
    $totalRows = $countStmt->fetchColumn();
    $totalPages = ceil($totalRows / $limit);

    // Fetch Data
    $sql = "SELECT reference_number, first_name, last_name, registration_type, nationality, created_at, status 
            FROM registrations 
            $whereSQL 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $val) $stmt->bindValue($key, $val);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    sendJsonResponse(true, 'Data fetched.', [
        'registrations' => $stmt->fetchAll(PDO::FETCH_ASSOC),
        'total_pages' => $totalPages,
        'current_page' => $page
    ]);
}

function handle_get_details($pdo, $data) {
    $ref = isset($data['ref']) ? sanitize($data['ref']) : ''; 
    if(empty($ref)) $ref = isset($data['reference_number']) ? sanitize($data['reference_number']) : '';

    if (empty($ref)) sendJsonResponse(false, 'Reference number required.', null, 400);

    // Get Tourist Details
    $stmt = $pdo->prepare("SELECT * FROM registrations WHERE reference_number = :ref");
    $stmt->execute([':ref' => $ref]);
    $tourist = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tourist) sendJsonResponse(false, 'Record not found.', null, 404);

    // Get Documents
    $docStmt = $pdo->prepare("SELECT document_type, file_path, uploaded_at FROM registration_documents WHERE reference_number = :ref");
    $docStmt->execute([':ref' => $ref]);
    $documents = $docStmt->fetchAll(PDO::FETCH_ASSOC);

    $tourist['documents'] = $documents;

    sendJsonResponse(true, 'Details fetched.', $tourist);
}

function handle_update_status($pdo, $data) {
    $ref = sanitize($data['ref'] ?? $data['reference_number'] ?? '');
    $status = sanitize($data['status'] ?? '');
    $reason = sanitize($data['reason'] ?? $data['rejection_reason'] ?? null);

    if (empty($ref) || !in_array($status, ['pending', 'approved', 'rejected'])) {
        sendJsonResponse(false, 'Invalid data.', null, 400);
    }

    if ($status === 'rejected' && empty($reason)) {
        sendJsonResponse(false, 'Rejection reason required.', null, 400);
    }

    // Assuming DB has 'rejection_reason' column
    $sql = "UPDATE registrations SET status = :status, rejection_reason = :reason WHERE reference_number = :ref";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([':status' => $status, ':reason' => $reason, ':ref' => $ref]);

    if ($success) {
        sendJsonResponse(true, 'Status updated successfully.');
    } else {
        sendJsonResponse(false, 'Update failed.');
    }
}

function handle_delete_registration($pdo, $data) {
    $ref = sanitize($data['reference_number'] ?? '');
    if (empty($ref)) sendJsonResponse(false, 'Reference number required.', null, 400);

    // 1. Get file paths to delete physical files
    $stmt = $pdo->prepare("SELECT file_path FROM registration_documents WHERE reference_number = :ref");
    $stmt->execute([':ref' => $ref]);
    $files = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $pdo->beginTransaction();

    try {
        // 2. Delete Documents from DB
        $pdo->prepare("DELETE FROM registration_documents WHERE reference_number = :ref")->execute([':ref' => $ref]);
        
        // 3. Delete Registration
        $stmtDel = $pdo->prepare("DELETE FROM registrations WHERE reference_number = :ref");
        $stmtDel->execute([':ref' => $ref]);

        if ($stmtDel->rowCount() > 0) {
            // 4. Delete Physical Files
            foreach ($files as $path) {
                // Fix for Windows paths: Convert backslashes to forward slashes
                $cleanPath = str_replace('\\', '/', $path);
                
                // Adjust path based on where files are stored relative to this script
                // 'backend/' -> go up to root -> 'uploads/'
                $fullPath = "../" . $cleanPath; 
                
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }
            $pdo->commit();
            sendJsonResponse(true, 'Deleted successfully.');
        } else {
            $pdo->rollBack();
            sendJsonResponse(false, 'Record not found or already deleted.');
        }
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handle_get_summary($pdo) {
    $summary = [
        'total' => 0,
        'pending' => 0,
        'approved' => 0,
        'rejected' => 0,
        'by_type' => [],
        'nationality_labels' => [],
        'nationality_data' => []
    ];

    // 1. Status Counts
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM registrations GROUP BY status");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $count = (int)$row['count'];
        $summary['total'] += $count;
        $summary[$row['status']] = $count; 
    }

    // 2. Type Counts (Existing)
    $stmtType = $pdo->query("SELECT registration_type, COUNT(*) as count FROM registrations WHERE status = 'approved' GROUP BY registration_type");
    while ($row = $stmtType->fetch(PDO::FETCH_ASSOC)) {
        $summary['by_type'][$row['registration_type']] = (int)$row['count'];
    }

    // 3. Nationality Counts (For Bar Chart)
    // Get top 5 nationalities by count
    $stmtNat = $pdo->query("SELECT nationality, COUNT(*) as count FROM registrations GROUP BY nationality ORDER BY count DESC LIMIT 5");
    while ($row = $stmtNat->fetch(PDO::FETCH_ASSOC)) {
        $label = !empty($row['nationality']) ? $row['nationality'] : 'Local/Unspecified';
        $summary['nationality_labels'][] = $label;
        $summary['nationality_data'][] = (int)$row['count'];
    }

    // Response structure
    $response = [
        'total_applications' => $summary['total'],
        'pending_count' => $summary['pending'],
        'approved_count' => $summary['approved'],
        'rejected_count' => $summary['rejected'],
        'by_grade_level' => $summary['by_type'], 
        'nationality_labels' => $summary['nationality_labels'],
        'nationality_counts' => $summary['nationality_data']
    ];

    sendJsonResponse(true, 'Summary loaded.', $response);
}
?>