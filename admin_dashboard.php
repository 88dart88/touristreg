<?php
// admin/dashboard.php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: admin/admin_login.html'); 
    exit; 
}

$adminDisplayName = htmlspecialchars($_SESSION['admin_username'] ?? 'Admin');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Tourist Registration</title>
    
    <link rel="stylesheet" href="css/admin.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

    <header>
        <div class="header-content">
            <div class="logo">Admin Panel - Tourist System</div>
            <div class="user-info">
                <span>Welcome, <?php echo $adminDisplayName; ?>!</span>
                <a href="backend/admin_logout.php" class="secondary-button" style="margin-left: 15px;">Logout</a>
            </div>
        </div>
    </header>

    <main class="admin-main">
        <nav class="tab-navigation">
            <button data-tab="enrollmentRequests" class="tab-button active">Registration Requests</button>
            <button data-tab="enrollmentSummary" class="tab-button">Summary & Stats</button>
        </nav>

        <section id="enrollmentRequestsContent" class="tab-content active-content">
            <div class="content-card">
                <div class="card-header">
                    <h3>Manage Applications</h3>
                    <div class="filter-controls" style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" id="searchInput" placeholder="Search Name or Ref No..." 
                               style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 220px;">
                               
                        <select id="filterStatus" name="filterStatus" style="padding: 8px; border-radius: 6px; border: 1px solid #d1d5db;">
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        
                        <button id="refreshRequests" class="primary-button">Search</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table enrollment-table">
                        <thead>
                            <tr>
                                <th>Ref No.</th>
                                <th>Tourist Name</th>
                                <th>Type</th>
                                <th>Nationality</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="enrollmentTableBody">
                            <tr><td colspan="7" style="text-align: center; padding: 20px;">Loading registrations...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div id="paginationControls" class="pagination-controls" style="margin-top: 15px; text-align: right;"></div>
            </div>
        </section>

        <section id="enrollmentSummaryContent" class="tab-content">
            <div class="content-card">
                <div class="card-header">
                    <h3>Dashboard Overview</h3>
                </div>

                <div id="summaryData" class="summary-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div class="summary-card pending" style="background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #f59e0b;">
                        <h4 style="margin:0; color:#6b7280; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Pending</h4>
                        <p id="statPending" style="font-size: 32px; font-weight: 800; color: #1f2937; margin: 10px 0 0 0;">0</p>
                    </div>
                    <div class="summary-card approved" style="background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #10b981;">
                        <h4 style="margin:0; color:#6b7280; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Approved</h4>
                        <p id="statApproved" style="font-size: 32px; font-weight: 800; color: #1f2937; margin: 10px 0 0 0;">0</p>
                    </div>
                    <div class="summary-card rejected" style="background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 5px solid #ef4444;">
                        <h4 style="margin:0; color:#6b7280; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Rejected</h4>
                        <p id="statRejected" style="font-size: 32px; font-weight: 800; color: #1f2937; margin: 10px 0 0 0;">0</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
                    
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h4 style="margin: 0 0 20px 0; color: #374151; font-size: 14px; text-transform: uppercase;">Status Breakdown</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>

                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h4 style="margin: 0 0 20px 0; color: #374151; font-size: 14px; text-transform: uppercase;">Top Nationalities</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="nationalityChart"></canvas>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </main>

    <div id="detailsModal" class="modal-overlay hidden">
        <div class="modal-box">
            <div class="modal-header">
                <h3>Registration Details</h3>
                <button id="closeModal" class="modal-close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="details-grid">
                    <p class="details-full-span section-title"><strong>Application Overview</strong></p>
                    <p><strong>Reference No:</strong> <span id="modalRefNo" class="data-value"></span></p>
                    <p><strong>Submission Date:</strong> <span id="modalSubmissionDate" class="data-value"></span></p>
                    <p><strong>Type:</strong> <span id="modalEnrollmentType" class="data-value"></span></p>
                    <p><strong>Nationality:</strong> <span id="modalNationality" class="data-value"></span></p>

                    <p class="details-full-span section-title"><strong>Tourist Information</strong></p>
                    <p><strong>Full Name:</strong> <span id="modalStudentName" class="data-value"></span></p>
                    <p><strong>Date of Birth:</strong> <span id="modalDob" class="data-value"></span></p>
                    <p><strong>Gender:</strong> <span id="modalGender" class="data-value"></span></p>
                    <p><strong>Religion:</strong> <span id="modalReligion" class="data-value"></span></p>
                    
                    <p class="hidden" id="modalIndigenousContainer"><strong>Indigenous Group:</strong> <span id="modalIndigenousGroup"></span></p>
                    <p><strong>Passport Status:</strong> <span id="modalPassportStatus" class="data-value"></span></p>
                    <p class="hidden" id="modalPassportNumContainer"><strong>Passport No:</strong> <span id="modalPassportNum"></span></p>

                    <p class="details-full-span section-title"><strong>Address</strong></p>
                    <p class="details-full-span"><span id="modalAddress" class="data-value"></span></p>
                    
                    <p class="details-full-span section-title"><strong>Emergency Contact</strong></p>
                    <p><strong>Name:</strong> <span id="modalEmergencyName" class="data-value"></span></p>
                    <p><strong>Relationship:</strong> <span id="modalEmergencyRel" class="data-value"></span></p>
                    <p><strong>Contact:</strong> <span id="modalEmergencyContact" class="data-value"></span></p>

                    <p class="details-full-span section-title"><strong>Travel Information</strong></p>
                    <p><strong>Purpose:</strong> <span id="modalPurpose" class="data-value"></span></p>
                    <p class="hidden" id="modalPackageContainer"><strong>Package:</strong> <span id="modalPackage"></span></p>

                    <p class="details-full-span section-title"><strong>Uploaded Documents</strong></p>
                    <div class="details-full-span" id="modalDocumentsList">
                        <p class="placeholder-text-small">Loading documents...</p>
                    </div>
                </div>

                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="modalStatus" style="font-weight: bold;">Update Status:</label>
                    <select id="modalStatus" name="status" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; width: 100%;">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                
                <div id="rejectionReasonGroup" class="form-group hidden">
                    <label for="modalRejectionReason" style="display:block; margin-bottom:5px;">Reason for Rejection:</label>
                    <textarea id="modalRejectionReason" rows="3" style="width:100%; padding:8px;" placeholder="Provide a reason..."></textarea>
                </div>
                
                <div class="modal-footer" style="text-align: right; margin-top: 20px;">
                    <button id="cancelModalButton" class="secondary-button" style="padding: 10px 20px;">Cancel</button>
                    <button id="saveStatusButton" class="primary-button" style="padding: 10px 20px;">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <div id="adminLoadingIndicator" class="loading-overlay hidden">
        <div style="background:white; padding:20px; border-radius:8px; display:inline-block;">Processing...</div>
    </div>

    <footer class="admin-footer" style="text-align: center; margin-top: 50px; padding: 20px; color: #777;">
        <p>&copy; <span id="currentYearAdmin"></span> Tourist Registration System - Admin Panel.</p>
    </footer>

    <script src="js/admin_script.js"></script> 
    <script>
        document.getElementById('currentYearAdmin').textContent = new Date().getFullYear();
    </script>
</body>
</html>