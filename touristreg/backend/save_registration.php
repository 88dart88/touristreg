<?php
session_start();

// Ensure you have this file created with your DB credentials ($pdo object)
require_once('db_conn.php'); 

$response = [
    'status' => 'error', // Changed key to 'status' to match your JS
    'message' => '',
    'reference_number' => '' // Changed key to 'reference_number' to match your JS
];

// 1. Helper Functions
function sanitizeInput($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

function generateReferenceNumber() {
    $prefix = 'TR'; // Tourist Registration
    $year = date('y'); // 2-digit year (e.g., 24)
    $month = date('m');
    $randomPart = strtoupper(substr(uniqid(), -5)); 
    return $prefix . $year . $month . '-' . $randomPart; // Example: TR2410-X9A2B
}

function sendJsonResponse($status, $message, $ref = '') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'reference_number' => $ref
    ]);
    exit;
}

// 2. Main Logic
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse('error', 'Invalid request method.');
}

try {
    if (!isset($pdo)) {
        throw new Exception("Database connection failed.");
    }

    // --- A. DATA COLLECTION & SANITIZATION ---
    
    // Registration Type
    $regType = sanitizeInput($_POST['registrationType'] ?? '');
    
    // Nationality Logic (Handle "Other" input)
    $nationalityVal = sanitizeInput($_POST['Nationality'] ?? '');
    $otherNationalityVal = sanitizeInput($_POST['otherNationality'] ?? '');
    $finalNationality = ($nationalityVal === 'Other') ? $otherNationalityVal : $nationalityVal;

    // Personal Info
    $lastName = sanitizeInput($_POST['lastName'] ?? '');
    $firstName = sanitizeInput($_POST['firstName'] ?? '');
    $middleName = sanitizeInput($_POST['middleName'] ?? '');
    $extName = sanitizeInput($_POST['extensionName'] ?? '');
    
    // Passport Info
    $passportStatus = sanitizeInput($_POST['passportStatus'] ?? ''); // 'with' or 'none'
    $passportNum = ($passportStatus === 'with') ? sanitizeInput($_POST['passportNum'] ?? '') : null;

    // Demographics
    $dob = sanitizeInput($_POST['dob'] ?? '');
    $placeOfBirth = sanitizeInput($_POST['placeOfBirth'] ?? '');
    $gender = sanitizeInput($_POST['gender'] ?? '');
    $religion = sanitizeInput($_POST['religion'] ?? '');
    $otherReligion = sanitizeInput($_POST['otherReligion'] ?? '');
    $finalReligion = ($religion === 'Other') ? $otherReligion : $religion;

    // Indigenous
    $indigenous = sanitizeInput($_POST['indigenous'] ?? 'no');
    $indGroup = sanitizeInput($_POST['indigenousGroup'] ?? '');
    $otherIndGroup = sanitizeInput($_POST['otherIndigenousGroup'] ?? '');
    $finalIndGroup = ($indigenous === 'yes') ? (($indGroup === 'Other') ? $otherIndGroup : $indGroup) : null;

    // Address
    $street = sanitizeInput($_POST['streetAddress'] ?? '');
    $barangay = sanitizeInput($_POST['barangay'] ?? '');
    $city = sanitizeInput($_POST['city'] ?? '');
    $province = sanitizeInput($_POST['province'] ?? '');
    $zip = sanitizeInput($_POST['zipCode'] ?? '');

    // Emergency Contact (Renamed from Guardian)
    $emLast = sanitizeInput($_POST['emergencyLastName'] ?? '');
    $emFirst = sanitizeInput($_POST['emergencyFirstName'] ?? '');
    $emMiddle = sanitizeInput($_POST['emergencyMiddleName'] ?? '');
    $emRel = sanitizeInput($_POST['emergencyRelationship'] ?? '');
    $otherRel = sanitizeInput($_POST['otherRelationship'] ?? '');
    $finalRel = ($emRel === 'Other') ? $otherRel : $emRel;
    $emContact = sanitizeInput($_POST['emergencyContact'] ?? '');
    $emEmail = sanitizeInput($_POST['emergencyEmail'] ?? '');

    // Travel Info
    $purpose = sanitizeInput($_POST['purpose'] ?? '');
    $trackPackage = sanitizeInput($_POST['trackPackage'] ?? ''); // Guided/Independent

    // --- B. VALIDATION (Server Side) ---
    if (empty($regType) || empty($lastName) || empty($firstName) || empty($purpose)) {
        throw new Exception("Missing required fields.");
    }

    // --- C. DATABASE INSERTION ---
    
    // Generate Reference
    $refNumber = generateReferenceNumber();

    $pdo->beginTransaction();

    // Note: You must create a table named 'registrations' with these columns
    $sql = "INSERT INTO registrations (
        reference_number, registration_type, nationality, 
        last_name, first_name, middle_name, extension_name,
        passport_status, passport_number,
        dob, place_of_birth, gender, religion, 
        is_indigenous, indigenous_group,
        street_address, barangay, city, province, zip_code,
        emergency_last_name, emergency_first_name, emergency_middle_name, 
        emergency_relationship, emergency_contact, emergency_email,
        purpose, travel_package, status, created_at
    ) VALUES (
        ?, ?, ?, 
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, 
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, 
        ?, ?, ?,
        ?, ?, 'pending', NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $refNumber, $regType, $finalNationality,
        $lastName, $firstName, $middleName, $extName,
        $passportStatus, $passportNum,
        $dob, $placeOfBirth, $gender, $finalReligion,
        $indigenous, $finalIndGroup,
        $street, $barangay, $city, $province, $zip,
        $emLast, $emFirst, $emMiddle,
        $finalRel, $emContact, $emEmail,
        $purpose, $trackPackage
    ]);

    // --- D. FILE UPLOADS ---
    
    $uploadDir = '../uploads/'; // Ensure this folder exists and is writable
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    // Map HTML input names to Database Document Types
    $expectedFiles = [
        'birthCertificate' => 'Birth Certificate',
        'validID' => 'Valid ID',
        'passportScan' => 'Passport Scan',
        'itinerary' => 'Itinerary',
        'hotelProof' => 'Hotel Proof',
        'returnTicket' => 'Return Ticket',
        'visa' => 'Visa',
        'proofResidence' => 'Proof of Residence'
    ];

    foreach ($expectedFiles as $inputName => $docType) {
        if (isset($_FILES[$inputName]) && $_FILES[$inputName]['error'] === UPLOAD_ERR_OK) {
            
            $tmpName = $_FILES[$inputName]['tmp_name'];
            $origName = basename($_FILES[$inputName]['name']);
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
            
            // Validate Type
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'])) {
                throw new Exception("Invalid file type for $docType");
            }

            // Generate unique filename: REF_DocType.ext
            $cleanDocType = preg_replace('/[^A-Za-z0-9]/', '', $docType);
            $newFileName = "{$refNumber}_{$cleanDocType}.{$ext}";
            $destination = $uploadDir . $newFileName;

            if (move_uploaded_file($tmpName, $destination)) {
                // Insert into documents table
                $docSql = "INSERT INTO registration_documents (reference_number, document_type, file_path, uploaded_at) VALUES (?, ?, ?, NOW())";
                $docStmt = $pdo->prepare($docSql);
                $docStmt->execute([$refNumber, $docType, $newFileName]);
            }
        }
    }

    $pdo->commit();
    sendJsonResponse('success', 'Registration submitted successfully!', $refNumber);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($e->getMessage()); // Log error to server logs
    sendJsonResponse('error', 'Submission failed: ' . $e->getMessage());
}
?>