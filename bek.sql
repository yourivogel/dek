-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2019 at 10:54 AM
-- Server version: 10.1.26-MariaDB
-- PHP Version: 7.1.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bek`
--
CREATE DATABASE IF NOT EXISTS `bek` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `bek`;

-- --------------------------------------------------------

--
-- Table structure for table `opdrachten`
--

CREATE TABLE `opdrachten` (
  `id` int(11) NOT NULL,
  `naam` varchar(255) NOT NULL,
  `niveau` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `opdrachten`
--

INSERT INTO `opdrachten` (`id`, `naam`, `niveau`) VALUES
(1, 'modals', 2);

-- --------------------------------------------------------

--
-- Table structure for table `vragen`
--

CREATE TABLE `vragen` (
  `id` int(11) NOT NULL,
  `vraag` varchar(255) NOT NULL,
  `antwoord` varchar(255) NOT NULL,
  `opdracht_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vragen`
--

INSERT INTO `vragen` (`id`, `vraag`, `antwoord`, `opdracht_id`) VALUES
(1, 'asd?', 'a', 1);

-- --------------------------------------------------------

--
-- Table structure for table `woorden`
--

CREATE TABLE `woorden` (
  `id` int(11) NOT NULL,
  `woord_NL` varchar(255) NOT NULL,
  `woord_EN` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `opdrachten`
--
ALTER TABLE `opdrachten`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vragen`
--
ALTER TABLE `vragen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vraag_opdracht` (`opdracht_id`);

--
-- Indexes for table `woorden`
--
ALTER TABLE `woorden`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `opdrachten`
--
ALTER TABLE `opdrachten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `vragen`
--
ALTER TABLE `vragen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `woorden`
--
ALTER TABLE `woorden`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `vragen`
--
ALTER TABLE `vragen`
  ADD CONSTRAINT `vraag_opdracht` FOREIGN KEY (`opdracht_id`) REFERENCES `opdrachten` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
