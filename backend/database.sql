-- Kosmos Energy VMS powered Vitotek Systems - MySQL Schema

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE IF NOT EXISTS `visitors` (
  `id` varchar(50) NOT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `purpose` varchar(100) DEFAULT NULL,
  `hostName` varchar(255) DEFAULT NULL,
  `hostDepartment` varchar(100) DEFAULT NULL,
  `photoUrl` longtext DEFAULT NULL,
  `signature` longtext DEFAULT NULL,
  `inviteCode` varchar(50) DEFAULT NULL,
  `idType` varchar(100) DEFAULT NULL,
  `idNumber` varchar(100) DEFAULT NULL,
  `checkInTime` varchar(50) DEFAULT NULL,
  `checkOutTime` varchar(50) DEFAULT NULL,
  `approvalTime` varchar(50) DEFAULT NULL,
  `badgeNumber` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inviteCode` (`inviteCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Initial Admin User (Password: admin123)
--

INSERT INTO `users` (`name`, `email`, `phoneNumber`, `password`, `role`, `department`) VALUES
('System Admin', 'admin@gatekeeper.com', '+2348000000000', 'admin123', 'admin', 'IT')
ON DUPLICATE KEY UPDATE id=id;

COMMIT;
