<?php

$db_host = 'localhost';
$db_name = 'tourist_db'; 
$db_user = 'root';
$db_pass = ''; 
$db_charset = 'utf8mb4';     

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {

    error_log("Database Connection Error: " . $e->getMessage() . " (Code: " . $e->getCode() . ")");

    die("Database connection failed. Please check the configuration or contact support if the issue persists.");
}

?>
