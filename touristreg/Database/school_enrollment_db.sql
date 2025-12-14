-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 17, 2025 at 04:22 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_enrollment_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL COMMENT 'Admin user ID',
  `username` varchar(50) NOT NULL COMMENT 'Admin username for login',
  `password_hash` varchar(255) NOT NULL COMMENT 'Securely hashed password',
  `email` varchar(100) DEFAULT NULL COMMENT 'Admin email address (optional, but useful)',
  `full_name` varchar(100) DEFAULT NULL COMMENT 'Full name of the admin (optional)',
  `role` varchar(20) NOT NULL DEFAULT 'admin' COMMENT 'Role of the admin (e.g., admin, superadmin)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Timestamp of when the admin account was created',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Timestamp of the last successful login'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores administrator credentials and basic information';

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `email`, `full_name`, `role`, `created_at`, `last_login`) VALUES
(1, 'bis_admin', '$2y$10$ryOZAw30IfWQrskvbA4eVujjaBI273Cby.y4a9wfsQHRWG99dlYhu', NULL, NULL, 'admin', '2025-05-16 10:44:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_status_updates`
--

CREATE TABLE `enrollment_status_updates` (
  `id` int(11) NOT NULL COMMENT 'Primary key for the status update record',
  `student_reference` varchar(20) NOT NULL COMMENT 'Foreign Key linking to students.reference_number',
  `status` varchar(20) NOT NULL COMMENT 'The status assigned (e.g., pending, approved, rejected)',
  `remarks` text DEFAULT NULL COMMENT 'Additional remarks or reasons for the status change (e.g., reason for rejection)',
  `updated_by` varchar(100) NOT NULL COMMENT 'Identifier of who made the update (e.g., System, admin_username)',
  `update_timestamp` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Timestamp of when the status update occurred'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs the history of enrollment status changes';

--
-- Dumping data for table `enrollment_status_updates`
--

INSERT INTO `enrollment_status_updates` (`id`, `student_reference`, `status`, `remarks`, `updated_by`, `update_timestamp`) VALUES
(2, 'BIS2025126957', 'pending', NULL, 'System', '2025-05-14 06:04:12'),
(3, 'BIS2025174596', 'pending', NULL, 'System', '2025-05-14 11:34:03'),
(4, 'BIS2025174596', 'approved', NULL, 'Admin', '2025-05-14 16:15:30'),
(5, 'BIS2025126957', 'rejected', 'Wrong documents submitted.', 'Admin', '2025-05-14 16:16:07'),
(6, 'BIS2025148738', 'pending', NULL, 'System', '2025-05-14 16:45:20'),
(7, 'BIS2025148738', 'approved', NULL, 'Admin', '2025-05-14 16:46:52'),
(8, 'BIS2025126957', 'rejected', 'Wrong documents submitted.', 'Admin', '2025-05-14 16:47:04'),
(9, 'BIS2025148738', 'approved', NULL, 'Admin', '2025-05-14 17:41:33'),
(10, 'BIS2025148738', 'approved', NULL, 'Admin', '2025-05-14 17:44:59'),
(11, 'BIS2025126957', 'rejected', 'Wrong documents submitted.', 'Admin', '2025-05-14 17:46:17'),
(12, 'BIS2025815810', 'pending', NULL, 'System', '2025-05-14 19:06:22'),
(13, 'BIS2025815810', 'approved', NULL, 'Admin', '2025-05-14 19:07:26'),
(14, 'BIS2025952446', 'pending', NULL, 'System', '2025-05-15 02:57:39'),
(15, 'BIS2025952446', 'approved', NULL, 'Admin', '2025-05-15 02:58:34'),
(16, 'BIS2025174596', 'rejected', 'wala lang', 'Admin', '2025-05-15 03:04:26'),
(17, 'BIS2025174596', 'approved', NULL, 'Admin', '2025-05-15 03:04:34'),
(18, 'BIS2025354969', 'pending', NULL, 'System', '2025-05-15 07:16:24'),
(19, 'BIS2025354969', 'approved', NULL, 'Admin', '2025-05-15 07:17:47');

-- --------------------------------------------------------

--
-- Table structure for table `grade_levels`
--

CREATE TABLE `grade_levels` (
  `id` int(11) NOT NULL COMMENT 'Primary key for the grade level record',
  `grade_name` varchar(50) NOT NULL COMMENT 'Display name for the grade level (e.g., Grade 1, Grade 7)',
  `grade_value` varchar(20) DEFAULT NULL COMMENT 'Internal value from the form (e.g., grade1, kindergarten), if different from grade_name. Must be unique for accurate joins.',
  `capacity` int(11) NOT NULL DEFAULT 100 COMMENT 'Maximum enrollment capacity for this grade level',
  `enrolled_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Current count of ''approved'' students for this grade level',
  `is_open` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Enrollment status for this grade: 1 for open, 0 for closed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Manages enrollment capacity and status per grade level';

--
-- Dumping data for table `grade_levels`
--

INSERT INTO `grade_levels` (`id`, `grade_name`, `grade_value`, `capacity`, `enrolled_count`, `is_open`) VALUES
(1, 'Kindergarten', 'kindergarten', 30, 0, 1),
(2, 'Grade 1', 'grade1', 50, 0, 1),
(3, 'Grade 2', 'grade2', 50, 0, 1),
(4, 'Grade 3', 'grade3', 50, 0, 1),
(5, 'Grade 4', 'grade4', 55, 0, 1),
(6, 'Grade 5', 'grade5', 60, 0, 1),
(7, 'Grade 6', 'grade6', 60, 0, 1),
(8, 'Grade 7', 'grade7', 70, 0, 1),
(9, 'Grade 8', 'grade8', 70, 1, 1),
(10, 'Grade 9', 'grade9', 75, 0, 1),
(11, 'Grade 10', 'grade10', 75, 2, 1),
(12, 'Grade 11', 'grade11', 80, 1, 1),
(13, 'Grade 12', 'grade12', 80, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `reference_number` varchar(20) NOT NULL COMMENT 'Unique reference number (e.g., BIS2024ABC123) - NOW PRIMARY KEY',
  `enrollment_type` varchar(20) NOT NULL COMMENT 'Type of enrollment (e.g., new, transferee, returning)',
  `first_name` varchar(100) NOT NULL COMMENT 'Student''s first name',
  `middle_name` varchar(100) DEFAULT NULL COMMENT 'Student''s middle name (optional)',
  `last_name` varchar(100) NOT NULL COMMENT 'Student''s last name',
  `extension_name` varchar(10) DEFAULT NULL COMMENT 'Name extension (e.g., Jr., Sr., III) (optional)',
  `lrn_status` varchar(10) NOT NULL COMMENT 'LRN availability (e.g., with, none)',
  `learner_reference_number` varchar(12) DEFAULT NULL COMMENT '12-digit Learner Reference Number (if lrn_status is ''with'')',
  `previous_school` varchar(255) DEFAULT NULL COMMENT 'Name of the previous school (for transferees)',
  `date_of_birth` date NOT NULL COMMENT 'Student''s date of birth',
  `place_of_birth` varchar(255) NOT NULL COMMENT 'Student''s place of birth',
  `age` int(3) NOT NULL COMMENT 'Calculated age of the student at the time of submission',
  `gender` varchar(20) NOT NULL COMMENT 'Student''s gender (e.g., male, female, other, prefer-not)',
  `religion` varchar(100) NOT NULL COMMENT 'Student''s religion',
  `other_religion` varchar(100) DEFAULT NULL COMMENT 'Specified religion if ''Other'' is selected (optional)',
  `indigenous` varchar(5) NOT NULL COMMENT 'Indicates if the student belongs to an indigenous group (yes/no)',
  `indigenous_group` varchar(100) DEFAULT NULL COMMENT 'Name of the indigenous group (if indigenous is ''yes'')',
  `other_indigenous_group` varchar(100) DEFAULT NULL COMMENT 'Specified indigenous group if ''Other'' is selected (optional)',
  `street_address` varchar(255) NOT NULL COMMENT 'Student''s street address',
  `barangay` varchar(100) NOT NULL COMMENT 'Student''s barangay',
  `city` varchar(100) NOT NULL COMMENT 'Student''s city or municipality',
  `province` varchar(100) NOT NULL COMMENT 'Student''s province',
  `zip_code` varchar(10) NOT NULL COMMENT 'Student''s zip code',
  `guardian_first_name` varchar(100) NOT NULL COMMENT 'Guardian''s first name',
  `guardian_middle_name` varchar(100) DEFAULT NULL COMMENT 'Guardian''s middle name (optional)',
  `guardian_last_name` varchar(100) NOT NULL COMMENT 'Guardian''s last name',
  `guardian_relationship` varchar(50) NOT NULL COMMENT 'Relationship of the guardian to the student',
  `other_relationship` varchar(100) DEFAULT NULL COMMENT 'Specified relationship if ''Other'' is selected (optional)',
  `guardian_contact` varchar(20) NOT NULL COMMENT 'Guardian''s contact number',
  `guardian_email` varchar(100) DEFAULT NULL COMMENT 'Guardian''s email address (optional)',
  `grade_level` varchar(20) NOT NULL COMMENT 'Grade level student is enrolling for (e.g., kindergarten, grade1, grade11)',
  `track` varchar(50) DEFAULT NULL COMMENT 'Academic track or strand for Senior High School (e.g., TVL, GAS) (optional)',
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'Current status of the enrollment application (pending, approved, rejected)',
  `rejection_reason` text DEFAULT NULL COMMENT 'Reason if the application is rejected',
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Timestamp of when the enrollment form was submitted',
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Timestamp of the last update to this record'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores student enrollment application details';

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`reference_number`, `enrollment_type`, `first_name`, `middle_name`, `last_name`, `extension_name`, `lrn_status`, `learner_reference_number`, `previous_school`, `date_of_birth`, `place_of_birth`, `age`, `gender`, `religion`, `other_religion`, `indigenous`, `indigenous_group`, `other_indigenous_group`, `street_address`, `barangay`, `city`, `province`, `zip_code`, `guardian_first_name`, `guardian_middle_name`, `guardian_last_name`, `guardian_relationship`, `other_relationship`, `guardian_contact`, `guardian_email`, `grade_level`, `track`, `status`, `rejection_reason`, `submission_date`, `last_updated`) VALUES
('BIS2025126957', 'new', 'Salvador', '', 'Ambrocio', 'Jr.', 'with', '123988080002', '', '2002-10-25', 'Gandara USA', 22, 'male', 'Other', 'Born Again', 'no', '', '', 'Purok 1', 'Aguit-itan', 'Calbayog City', 'Samar', '6710', 'Arlie', '', 'Ambrocio', 'Mother', '', '0907 603 0800', 'salvadorpogi@yt.com', 'grade12', 'tvl', 'rejected', 'Wrong documents submitted.', '2025-05-14 06:04:12', '2025-05-14 17:46:17'),
('BIS2025148738', 'new', 'Pedro', '', 'Penduko', '', 'none', '', '', '2002-07-20', 'Los Angeles', 22, 'female', 'Baptist', '', 'no', '', '', 'Purok 7', 'Hamorawon', 'Calbayog City', 'Samar', '6710', 'Letty', '', 'Penduko', 'Mother', '', '0981 414 1515', 'lettyi@yt.com', 'grade12', 'tvl', 'approved', NULL, '2025-05-14 16:45:20', '2025-05-14 17:44:59'),
('BIS2025174596', 'returning', 'Juan', '', 'Dela Cruz', '', 'none', '', '', '2000-05-25', 'California', 24, 'male', 'Seventh Day Adventist', '', 'no', '', '', 'Purok 10', 'Rawis', 'Calbayog City', 'Samar', '6710', 'Kobe', '', 'Bryant', 'Grandparent', '', '0992 051 4074', 'salvadorgwapo@yt.com', 'grade8', '', 'approved', NULL, '2025-05-14 11:34:03', '2025-05-15 03:04:34'),
('BIS2025354969', 'transferee', 'Samboy', 'Amit', 'Orcales', '', 'none', '', 'Napalisan Elementary School', '2003-04-04', 'Pasay', 22, 'prefer-not', 'Roman Catholic', '', 'no', '', '', 'Purok 7', 'Carmen', 'Calbayog City', 'Samar', '6710', 'Samuel', 'Estrelles', 'Orcales', 'Father', '', '0937 432 4853', 'salvadorgwapo@yt.com', 'grade10', '', 'approved', NULL, '2025-05-15 07:16:24', '2025-05-15 07:17:47'),
('BIS2025815810', 'transferee', 'Jear', 'Casaljay', 'Molleno', '', 'with', '123985080671', 'Pilot Central School', '2010-08-27', 'Calbayog City', 14, 'male', 'Roman Catholic', '', 'no', '', '', 'Purok 4', 'Bagacay', 'Calbayog City', 'Samar', '6710', 'Hero', 'Casaljay', 'Molleno', 'Sibling', '', '0916 841 5152', 'mollenohero21@gmail.com', 'grade11', 'gas', 'approved', NULL, '2025-05-14 19:06:22', '2025-05-14 19:07:26'),
('BIS2025952446', 'new', 'Dean', 'Tarrayo', 'Ambrose', '', 'with', '608904147174', '', '2015-02-18', 'Metro Manila', 10, 'male', 'Roman Catholic', '', 'no', '', '', 'Purok 2', 'Bagacay', 'Calbayog City', 'Samar', '6710', 'Dianna', 'Tarrayo', 'Ambrose', 'Mother', '', '0931 314 7149', 'diannaambrose@gmail.com', 'grade10', '', 'approved', NULL, '2025-05-15 02:57:39', '2025-05-15 02:58:34');

-- --------------------------------------------------------

--
-- Table structure for table `student_documents`
--

CREATE TABLE `student_documents` (
  `id` int(11) NOT NULL COMMENT 'Primary key for the document record',
  `student_reference` varchar(20) NOT NULL COMMENT 'Foreign Key linking to students.reference_number',
  `document_type` varchar(100) NOT NULL COMMENT 'Type of the uploaded document (e.g., Birth Certificate, Form 137)',
  `file_path` varchar(255) NOT NULL COMMENT 'Server path where the uploaded file is stored',
  `original_filename` varchar(255) NOT NULL COMMENT 'Original name of the uploaded file',
  `upload_timestamp` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Timestamp of when the document was uploaded'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores paths and info of uploaded student documents';

--
-- Dumping data for table `student_documents`
--

INSERT INTO `student_documents` (`id`, `student_reference`, `document_type`, `file_path`, `original_filename`, `upload_timestamp`) VALUES
(4, 'BIS2025126957', 'Birth Certificate', 'uploads/BIS2025126957_birthCertificate.jpg', 'Acer_Wallpaper_01_3840x2400.jpg', '2025-05-14 06:04:12'),
(5, 'BIS2025126957', 'ID Document', 'uploads/BIS2025126957_idDocument.jpg', 'Acer_Wallpaper_03_3840x2400.jpg', '2025-05-14 06:04:12'),
(6, 'BIS2025174596', 'Birth Certificate', 'uploads/BIS2025174596_birthCertificate.jpg', 'Acer_Wallpaper_01_3840x2400.jpg', '2025-05-14 11:34:03'),
(7, 'BIS2025174596', 'Report Card', 'uploads/BIS2025174596_reportCard.jpg', 'Acer_Wallpaper_03_3840x2400.jpg', '2025-05-14 11:34:03'),
(8, 'BIS2025148738', 'Birth Certificate', 'uploads/BIS2025148738_birthCertificate.jpg', 'IMG_20240210_090519_801.jpg', '2025-05-14 16:45:20'),
(9, 'BIS2025148738', 'ID Document', 'uploads/BIS2025148738_idDocument.jpg', 'IMG_20240210_090543_992.jpg', '2025-05-14 16:45:20'),
(10, 'BIS2025815810', 'Birth Certificate', 'uploads/BIS2025815810_birthCertificate.jpg', '1696556070692.jpg', '2025-05-14 19:06:23'),
(11, 'BIS2025815810', 'Form 137', 'uploads/BIS2025815810_form137.jpg', '1696556256476.jpg', '2025-05-14 19:06:23'),
(12, 'BIS2025815810', 'Good Moral Certificate', 'uploads/BIS2025815810_goodMoral.docx', 'DLL_MATHEMATICS 5_Q4_W1.docx', '2025-05-14 19:06:23'),
(13, 'BIS2025952446', 'Birth Certificate', 'uploads/BIS2025952446_birthCertificate.jpg', 'images.jpg', '2025-05-15 02:57:39'),
(14, 'BIS2025952446', 'ID Document', 'uploads/BIS2025952446_idDocument.jpg', '58zzYthT.jpg', '2025-05-15 02:57:39'),
(15, 'BIS2025354969', 'Birth Certificate', 'uploads/BIS2025354969_birthCertificate.png', 'logo.png', '2025-05-15 07:16:24'),
(16, 'BIS2025354969', 'Form 137', 'uploads/BIS2025354969_form137.jpg', 'OIP.jpg', '2025-05-15 07:16:24'),
(17, 'BIS2025354969', 'Good Moral Certificate', 'uploads/BIS2025354969_goodMoral.png', 'logo.png', '2025-05-15 07:16:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `uk_username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `enrollment_status_updates`
--
ALTER TABLE `enrollment_status_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_reference_status_log` (`student_reference`);

--
-- Indexes for table `grade_levels`
--
ALTER TABLE `grade_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grade_name` (`grade_name`),
  ADD UNIQUE KEY `grade_value` (`grade_value`),
  ADD KEY `idx_grade_name_capacity` (`grade_name`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`reference_number`),
  ADD KEY `idx_last_name` (`last_name`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_reference_docs` (`student_reference`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Admin user ID', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `enrollment_status_updates`
--
ALTER TABLE `enrollment_status_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for the status update record', AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `grade_levels`
--
ALTER TABLE `grade_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for the grade level record', AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key for the document record', AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `enrollment_status_updates`
--
ALTER TABLE `enrollment_status_updates`
  ADD CONSTRAINT `fk_status_log_student_reference` FOREIGN KEY (`student_reference`) REFERENCES `students` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD CONSTRAINT `fk_docs_student_reference` FOREIGN KEY (`student_reference`) REFERENCES `students` (`reference_number`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
