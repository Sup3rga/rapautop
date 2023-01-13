-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 13, 2023 at 05:42 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `museautop`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `caption` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_at` datetime NOT NULL,
  `modified_by` int(11) NOT NULL,
  `reading` int(11) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `dislikes` int(11) NOT NULL DEFAULT 0,
  `category` int(11) NOT NULL,
  `branch` int(11) NOT NULL,
  `post_on` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `articles_pictures`
--

CREATE TABLE `articles_pictures` (
  `id` int(11) NOT NULL,
  `img` int(11) NOT NULL,
  `article` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `id` int(11) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `attached_to` enum('A','P') NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_at` datetime NOT NULL,
  `modified_by` int(11) NOT NULL,
  `branch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `client_snapshot`
--

CREATE TABLE `client_snapshot` (
  `id` int(11) NOT NULL,
  `file` text NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `communauty`
--

CREATE TABLE `communauty` (
  `id` int(11) NOT NULL,
  `branch` int(11) NOT NULL,
  `manager` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `mailing`
--

CREATE TABLE `mailing` (
  `id` int(11) NOT NULL,
  `client` int(11) NOT NULL,
  `object` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL,
  `post_on` datetime NOT NULL,
  `posted_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `manager`
--

CREATE TABLE `manager` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `access` text NOT NULL,
  `code` text NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `active` set('0','1') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `messenging`
--

CREATE TABLE `messenging` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `client` int(11) NOT NULL,
  `message` text NOT NULL,
  `post_on` datetime NOT NULL,
  `read_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pictures`
--

CREATE TABLE `pictures` (
  `id` int(11) NOT NULL,
  `path` text NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `punchlines`
--

CREATE TABLE `punchlines` (
  `id` int(11) NOT NULL,
  `presentation` int(11) NOT NULL,
  `picture` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `lyrics` text DEFAULT NULL,
  `punchline` text NOT NULL,
  `year` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_at` datetime NOT NULL,
  `modified_by` int(11) NOT NULL,
  `post_on` datetime NOT NULL,
  `branch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `session_trace`
--

CREATE TABLE `session_trace` (
  `client` int(11) NOT NULL,
  `token` text NOT NULL,
  `created_at` datetime NOT NULL,
  `last_seen` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `subscriber`
--

CREATE TABLE `subscriber` (
  `id` int(11) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `contact` int(11) NOT NULL,
  `news` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `branch` int(11) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `sys_pref`
--

CREATE TABLE `sys_pref` (
  `metadata` varchar(255) NOT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pic_caption` (`caption`),
  ADD KEY `fk_man_creator` (`created_by`),
  ADD KEY `fk_man_editor` (`modified_by`),
  ADD KEY `fk_cat_art` (`category`),
  ADD KEY `fk_branch_art` (`branch`);

--
-- Indexes for table `articles_pictures`
--
ALTER TABLE `articles_pictures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_art_img` (`img`),
  ADD KEY `fk_art_id` (`article`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_man_cat_creator` (`created_by`),
  ADD KEY `fk_man_cat_editor` (`modified_by`),
  ADD KEY `fk_branch_cat` (`branch`);

--
-- Indexes for table `client_snapshot`
--
ALTER TABLE `client_snapshot`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `communauty`
--
ALTER TABLE `communauty`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_man_com` (`manager`),
  ADD KEY `fk_branch_com` (`branch`);

--
-- Indexes for table `mailing`
--
ALTER TABLE `mailing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subs_cli` (`client`),
  ADD KEY `fk_man_mail` (`posted_by`);

--
-- Indexes for table `manager`
--
ALTER TABLE `manager`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_man_mentor` (`created_by`);

--
-- Indexes for table `messenging`
--
ALTER TABLE `messenging`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sub_cli_mess` (`client`),
  ADD KEY `fk_man_mess` (`read_by`);

--
-- Indexes for table `pictures`
--
ALTER TABLE `pictures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_man_pic_creator` (`created_by`);

--
-- Indexes for table `punchlines`
--
ALTER TABLE `punchlines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_base_pic` (`presentation`),
  ADD KEY `fk_final_pic` (`picture`),
  ADD KEY `fk_cat_punch` (`category`),
  ADD KEY `fk_man_punch_creator` (`created_by`),
  ADD KEY `fk_man_punch_editor` (`modified_by`),
  ADD KEY `fk_branch_punch` (`branch`);

--
-- Indexes for table `session_trace`
--
ALTER TABLE `session_trace`
  ADD KEY `fk_man_session` (`client`);

--
-- Indexes for table `subscriber`
--
ALTER TABLE `subscriber`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_branch_mail` (`branch`,`mail`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `articles_pictures`
--
ALTER TABLE `articles_pictures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_snapshot`
--
ALTER TABLE `client_snapshot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `communauty`
--
ALTER TABLE `communauty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mailing`
--
ALTER TABLE `mailing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `manager`
--
ALTER TABLE `manager`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messenging`
--
ALTER TABLE `messenging`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pictures`
--
ALTER TABLE `pictures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `punchlines`
--
ALTER TABLE `punchlines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriber`
--
ALTER TABLE `subscriber`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `fk_branch_art` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`),
  ADD CONSTRAINT `fk_cat_art` FOREIGN KEY (`category`) REFERENCES `category` (`id`),
  ADD CONSTRAINT `fk_man_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`),
  ADD CONSTRAINT `fk_man_editor` FOREIGN KEY (`modified_by`) REFERENCES `manager` (`id`),
  ADD CONSTRAINT `fk_pic_caption` FOREIGN KEY (`caption`) REFERENCES `pictures` (`id`);

--
-- Constraints for table `articles_pictures`
--
ALTER TABLE `articles_pictures`
  ADD CONSTRAINT `fk_art_id` FOREIGN KEY (`article`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `fk_art_img` FOREIGN KEY (`img`) REFERENCES `pictures` (`id`);

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `fk_branch_cat` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`),
  ADD CONSTRAINT `fk_man_cat_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`),
  ADD CONSTRAINT `fk_man_cat_editor` FOREIGN KEY (`modified_by`) REFERENCES `manager` (`id`);

--
-- Constraints for table `communauty`
--
ALTER TABLE `communauty`
  ADD CONSTRAINT `fk_branch_com` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_man_com` FOREIGN KEY (`manager`) REFERENCES `manager` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mailing`
--
ALTER TABLE `mailing`
  ADD CONSTRAINT `fk_man_mail` FOREIGN KEY (`posted_by`) REFERENCES `manager` (`id`),
  ADD CONSTRAINT `fk_subs_cli` FOREIGN KEY (`client`) REFERENCES `subscriber` (`id`);

--
-- Constraints for table `manager`
--
ALTER TABLE `manager`
  ADD CONSTRAINT `fk_man_mentor` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`);

--
-- Constraints for table `messenging`
--
ALTER TABLE `messenging`
  ADD CONSTRAINT `fk_man_mess` FOREIGN KEY (`read_by`) REFERENCES `manager` (`id`),
  ADD CONSTRAINT `fk_sub_cli_mess` FOREIGN KEY (`client`) REFERENCES `subscriber` (`id`);

--
-- Constraints for table `pictures`
--
ALTER TABLE `pictures`
  ADD CONSTRAINT `fk_man_pic_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`);

--
-- Constraints for table `punchlines`
--
ALTER TABLE `punchlines`
  ADD CONSTRAINT `fk_base_pic` FOREIGN KEY (`presentation`) REFERENCES `pictures` (`id`),
  ADD CONSTRAINT `fk_branch_punch` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`),
  ADD CONSTRAINT `fk_cat_punch` FOREIGN KEY (`category`) REFERENCES `category` (`id`),
  ADD CONSTRAINT `fk_final_pic` FOREIGN KEY (`picture`) REFERENCES `pictures` (`id`),
  ADD CONSTRAINT `fk_man_punch_creator` FOREIGN KEY (`created_by`) REFERENCES `manager` (`id`),
  ADD CONSTRAINT `fk_man_punch_editor` FOREIGN KEY (`modified_by`) REFERENCES `manager` (`id`);

--
-- Constraints for table `session_trace`
--
ALTER TABLE `session_trace`
  ADD CONSTRAINT `fk_man_session` FOREIGN KEY (`client`) REFERENCES `manager` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriber`
--
ALTER TABLE `subscriber`
  ADD CONSTRAINT `fk_branch_subscribe` FOREIGN KEY (`branch`) REFERENCES `branch` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
