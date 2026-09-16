-- MySQL dump 10.13  Distrib 8.4.11, for Win64 (x86_64)
--
-- Host: altaria.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.7.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--



--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Admin',
  `status` enum('Active','Inactive') COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Admin','admin@carsey.in',NULL,'$2b$10$sOZ2M2JXlWkoYmklVi1CVeBPpEm5.5CW2PX3L1h5b049dCa4SdnNG','Admin','Active','2026-08-07 06:43:46'),(2,'karan','karan@gmail.com',NULL,'$2b$10$EYA.NCT349.FiUcyRYuSAO7Tbi6gSyiWwMgszzRKyvU0llzsRr6.m','Employee','Active','2026-09-08 04:58:53'),(3,'Abc','abc@gmail.com',NULL,'$2b$10$tYRWx0WjWIhLE2pffwwyEOGjESjm9KMDuKhaD7BZT.sC462bTwtRW','Employee','Active','2026-09-09 05:15:21'),(4,'Nitesh Arya','niteshkarya89@gmail.com',NULL,'$2b$10$cSsUJWjc44G3V.ty3e/U..tatmW5BuXEFdb2PFSx80bQO2Tk00lsa','Employee','Active','2026-09-09 09:26:14'),(5,'Umesh Yadav','uyadav97736@gmail.com',NULL,'$2b$10$aZ3KGB4eZRO7Cwxp1bNyge.hEvKJ89DophrPqd12gzDdGndgDKOs2','Employee','Active','2026-09-10 13:32:41'),(6,'Ayush','semwalaayush552@gmail.com',NULL,'$2b$10$guWr8GRnNOO6nP6nIBquPuihbZ2G3BlAFrimtj9xMvoAifB8kRtli','Employee','Active','2026-09-11 07:32:09'),(7,'Lakhan','lakhanneet09999@gamil.com','9149035749','$2b$10$mzh.9Cq69gdHFsBp4iG/SuPo2eobUXob4i7FW18SFg5xCajUyvIfK','Employee','Active','2026-09-15 08:51:21');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `car_images`
--

DROP TABLE IF EXISTS `car_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `car_id` int NOT NULL,
  `image_type` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `image_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_car_images_car_id` (`car_id`),
  KEY `idx_car_images_type` (`image_type`),
  CONSTRAINT `fk_car_images_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=345 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car_images`
--

LOCK TABLES `car_images` WRITE;
/*!40000 ALTER TABLE `car_images` DISABLE KEYS */;
INSERT INTO `car_images` VALUES (103,10,'Front View','/uploads/vehicles/1789122904266-893724988.jpg',1,'2026-09-11 10:35:06'),(104,10,'Rear View','/uploads/vehicles/1789122904284-974708882.jpg',0,'2026-09-11 10:35:06'),(105,10,'Left Side','/uploads/vehicles/1789122905356-258901998.jpg',0,'2026-09-11 10:35:06'),(106,10,'Right Side','/uploads/vehicles/1789122905462-440636849.jpg',0,'2026-09-11 10:35:06'),(107,10,'Interior','/uploads/vehicles/1789122905534-951128692.jpg',0,'2026-09-11 10:35:06'),(108,10,'Seat','/uploads/vehicles/1789122905831-362443133.jpg',0,'2026-09-11 10:35:06'),(109,10,'Engine','/uploads/vehicles/1789122905701-822895261.jpg',0,'2026-09-11 10:35:06'),(110,10,'Dashboard','/uploads/vehicles/1789122905656-820641266.jpg',0,'2026-09-11 10:35:06'),(111,10,'Odometer','/uploads/vehicles/1789122905592-770050678.jpg',0,'2026-09-11 10:35:06'),(112,10,'Dicky','/uploads/vehicles/1789122905888-790346297.jpg',0,'2026-09-11 10:35:06'),(113,10,'Detailed|engine_bay|Engine','/uploads/vehicles/1789122906056-677695742.jpg',0,'2026-09-11 10:35:06'),(114,10,'Detailed|documents_title|Documents / Title','/uploads/vehicles/1789122906196-914320922.jpg',0,'2026-09-11 10:35:06'),(115,10,'Detailed|engine_bay|Engine Oil','/uploads/vehicles/1789122905968-545486583.jpg',0,'2026-09-11 10:35:06'),(204,15,'Front View','/uploads/vehicles/1789206154840-430180284.jpg',1,'2026-09-12 09:43:02'),(205,15,'Rear View','/uploads/vehicles/1789206155276-730094314.jpg',0,'2026-09-12 09:43:02'),(206,15,'Interior','/uploads/vehicles/1789206155476-232533526.jpg',0,'2026-09-12 09:43:02'),(207,15,'Left Side','/uploads/vehicles/1789206155283-546890896.jpg',0,'2026-09-12 09:43:02'),(208,15,'Odometer','/uploads/vehicles/1789206155477-256355087.jpg',0,'2026-09-12 09:43:02'),(209,15,'Right Side','/uploads/vehicles/1789206155293-183079254.jpg',0,'2026-09-12 09:43:02'),(210,15,'Dashboard','/uploads/vehicles/1789206156069-30213653.jpg',0,'2026-09-12 09:43:02'),(211,15,'Engine','/uploads/vehicles/1789206156073-701182718.jpg',0,'2026-09-12 09:43:02'),(212,15,'Seat','/uploads/vehicles/1789206156077-263162609.jpg',0,'2026-09-12 09:43:02'),(213,15,'Dicky','/uploads/vehicles/1789206156079-306495994.jpg',0,'2026-09-12 09:43:02'),(214,15,'Document - Insurance','/uploads/vehicles/1789206156108-54370816.jpg',0,'2026-09-12 09:43:02'),(215,15,'Document - PUC','/uploads/vehicles/1789206156138-568176944.jpg',0,'2026-09-12 09:43:02'),(216,15,'Document - Service History','/uploads/vehicles/1789206156386-531267176.jpg',0,'2026-09-12 09:43:02'),(217,15,'Document - Duplicate Key','/uploads/vehicles/1789206157358-604342641.jpg',0,'2026-09-12 09:43:02'),(218,15,'Document - Registration Details','/uploads/vehicles/1789206158141-953239906.jpg',0,'2026-09-12 09:43:02'),(219,15,'Engine Video','/uploads/vehicles/1789206158928-610398406.mp4',0,'2026-09-12 09:43:02'),(220,15,'Engine Blow By Video','/uploads/vehicles/1789206168919-196731848.webm',0,'2026-09-12 09:43:02'),(221,15,'Test Drive Photo 1','/uploads/vehicles/1789206170695-913925324.jpg',0,'2026-09-12 09:43:02'),(222,15,'Test Drive Photo 2','/uploads/vehicles/1789206171114-680135305.jpg',0,'2026-09-12 09:43:02'),(223,15,'Test Drive Video','/uploads/vehicles/1789206171701-646607385.mp4',0,'2026-09-12 09:43:02'),(224,15,'Document - RC','/uploads/vehicles/1789206156096-209560063.jpg',0,'2026-09-12 09:43:02'),(225,16,'Front View','/uploads/vehicles/1789290551289-253826077.jpg',1,'2026-09-13 09:09:11'),(226,16,'Rear View','/uploads/vehicles/1789290551292-555914264.jpg',0,'2026-09-13 09:09:11'),(227,16,'Left Side','/uploads/vehicles/1789290551295-71360453.jpg',0,'2026-09-13 09:09:11'),(228,16,'Interior','/uploads/vehicles/1789290551301-882641589.jpg',0,'2026-09-13 09:09:11'),(229,16,'Right Side','/uploads/vehicles/1789290551299-719678538.jpg',0,'2026-09-13 09:09:11'),(230,16,'Odometer','/uploads/vehicles/1789290551302-898980230.jpg',0,'2026-09-13 09:09:11'),(231,16,'Seat','/uploads/vehicles/1789290551310-977544171.jpg',0,'2026-09-13 09:09:11'),(232,16,'Engine','/uploads/vehicles/1789290551302-957073662.jpg',0,'2026-09-13 09:09:11'),(233,16,'Dashboard','/uploads/vehicles/1789290551302-829260329.jpg',0,'2026-09-13 09:09:11'),(234,16,'Dicky','/uploads/vehicles/1789290551313-799243661.jpg',0,'2026-09-13 09:09:11'),(235,16,'Document - Insurance','/uploads/vehicles/1789290551333-32600109.jpg',0,'2026-09-13 09:09:11'),(236,16,'Document - Duplicate Key','/uploads/vehicles/1789290551338-964632714.jpg',0,'2026-09-13 09:09:11'),(237,16,'Engine Video','/uploads/vehicles/1789290551341-4037857.webm',0,'2026-09-13 09:09:11'),(238,16,'Engine Blow By Video','/uploads/vehicles/1789290551623-481071776.webm',0,'2026-09-13 09:09:11'),(239,16,'Test Drive Photo 1','/uploads/vehicles/1789290551847-405339613.jpg',0,'2026-09-13 09:09:11'),(240,16,'Test Drive Photo 2','/uploads/vehicles/1789290551874-252536697.jpg',0,'2026-09-13 09:09:11'),(241,16,'Test Drive Video','/uploads/vehicles/1789290551883-29978171.webm',0,'2026-09-13 09:09:11'),(242,16,'Document - RC','/uploads/vehicles/1789290551323-303821740.png',0,'2026-09-13 09:09:11'),(243,17,'Front View','/uploads/vehicles/1789317583492-748019741.jpg',1,'2026-09-13 16:40:05'),(244,17,'Rear View','/uploads/vehicles/1789317583518-309216354.jpg',0,'2026-09-13 16:40:05'),(245,17,'Document - Insurance','/uploads/vehicles/1789317585678-104610119.jpg',0,'2026-09-13 16:40:05'),(246,17,'Document - PUC','/uploads/vehicles/1789317586481-971937247.jpg',0,'2026-09-13 16:40:05'),(247,17,'Interior','/uploads/vehicles/1789317583571-23270941.jpg',0,'2026-09-13 16:40:05'),(248,17,'Right Side','/uploads/vehicles/1789317583556-804903451.jpg',0,'2026-09-13 16:40:05'),(249,17,'Dashboard','/uploads/vehicles/1789317583593-884305324.jpg',0,'2026-09-13 16:40:05'),(250,17,'Engine','/uploads/vehicles/1789317583607-837739753.jpg',0,'2026-09-13 16:40:05'),(251,17,'Seat','/uploads/vehicles/1789317584086-254856879.jpg',0,'2026-09-13 16:40:05'),(252,17,'Dicky','/uploads/vehicles/1789317584564-128861394.jpg',0,'2026-09-13 16:40:05'),(253,17,'Document - RC','/uploads/vehicles/1789317584980-445549140.jpg',0,'2026-09-13 16:40:05'),(254,17,'Left Side','/uploads/vehicles/1789317583532-25068875.jpg',0,'2026-09-13 16:40:05'),(255,17,'Document - Service History','/uploads/vehicles/1789317587303-662660872.jpg',0,'2026-09-13 16:40:05'),(256,17,'Document - Duplicate Key','/uploads/vehicles/1789317587835-567772120.jpg',0,'2026-09-13 16:40:05'),(257,17,'Document - Registration Details','/uploads/vehicles/1789317588412-289130741.jpg',0,'2026-09-13 16:40:05'),(258,17,'Odometer','/uploads/vehicles/1789317583579-318896723.jpg',0,'2026-09-13 16:40:05'),(259,17,'Engine Video','/uploads/vehicles/1789317588948-508743447.mp4',0,'2026-09-13 16:40:05'),(260,17,'Engine Blow By Video','/uploads/vehicles/1789317594348-317938995.mp4',0,'2026-09-13 16:40:05'),(261,17,'Test Drive Photo 1','/uploads/vehicles/1789317599268-440164642.jpg',0,'2026-09-13 16:40:05'),(262,17,'Test Drive Photo 2','/uploads/vehicles/1789317599810-887567611.jpg',0,'2026-09-13 16:40:05'),(263,17,'Test Drive Video','/uploads/vehicles/1789317600376-891394313.mp4',0,'2026-09-13 16:40:05'),(264,18,'Front View','/uploads/vehicles/1789322035054-432326816.jpg',1,'2026-09-13 17:54:08'),(265,18,'Rear View','/uploads/vehicles/1789322035056-638644570.jpg',0,'2026-09-13 17:54:08'),(266,18,'Left Side','/uploads/vehicles/1789322035057-902051707.jpg',0,'2026-09-13 17:54:08'),(267,18,'Right Side','/uploads/vehicles/1789322035059-845927669.jpg',0,'2026-09-13 17:54:08'),(268,18,'Interior','/uploads/vehicles/1789322035059-726340476.jpg',0,'2026-09-13 17:54:08'),(269,18,'Odometer','/uploads/vehicles/1789322035060-114365159.jpg',0,'2026-09-13 17:54:08'),(270,18,'Dashboard','/uploads/vehicles/1789322035060-2641277.jpg',0,'2026-09-13 17:54:08'),(271,18,'Engine','/uploads/vehicles/1789322035061-844995591.jpg',0,'2026-09-13 17:54:08'),(272,18,'Seat','/uploads/vehicles/1789322035062-955723545.jpg',0,'2026-09-13 17:54:08'),(273,18,'Dicky','/uploads/vehicles/1789322035062-310889290.jpg',0,'2026-09-13 17:54:08'),(274,18,'Document - Registration Details','/uploads/vehicles/1789322036977-546990668.jpg',0,'2026-09-13 17:54:08'),(275,18,'Engine Video','/uploads/vehicles/1789322038293-6629350.webm',0,'2026-09-13 17:54:08'),(276,18,'Engine Blow By Video','/uploads/vehicles/1789322039309-575376287.webm',0,'2026-09-13 17:54:08'),(277,18,'Test Drive Photo 1','/uploads/vehicles/1789322039561-375154728.png',0,'2026-09-13 17:54:08'),(278,18,'Test Drive Photo 2','/uploads/vehicles/1789322043658-624071291.png',0,'2026-09-13 17:54:08'),(279,18,'Test Drive Video','/uploads/vehicles/1789322048126-252475828.webm',0,'2026-09-13 17:54:08'),(280,18,'Document - RC','/uploads/vehicles/1789322035062-538150334.jpg',0,'2026-09-13 17:54:08'),(297,20,'Front View','/uploads/vehicles/1789384000106-615132707.jpg',1,'2026-09-14 11:06:41'),(298,20,'Left Side','/uploads/vehicles/1789384000114-795203605.jpg',0,'2026-09-14 11:06:41'),(299,20,'Right Side','/uploads/vehicles/1789384000115-892394682.jpg',0,'2026-09-14 11:06:41'),(300,20,'Interior','/uploads/vehicles/1789384000120-758211962.jpg',0,'2026-09-14 11:06:41'),(301,20,'Rear View','/uploads/vehicles/1789384000112-18525408.jpg',0,'2026-09-14 11:06:41'),(302,20,'Engine Video','/uploads/vehicles/1789384001184-325787098.webm',0,'2026-09-14 11:06:41'),(303,20,'Engine Blow By Video','/uploads/vehicles/1789384001184-322438102.webm',0,'2026-09-14 11:06:41'),(304,20,'Test Drive Photo 2','/uploads/vehicles/1789384001265-48237035.png',0,'2026-09-14 11:06:41'),(305,20,'Test Drive Photo 1','/uploads/vehicles/1789384001184-790238475.png',0,'2026-09-14 11:06:41'),(306,20,'Test Drive Video','/uploads/vehicles/1789384001341-299086754.webm',0,'2026-09-14 11:06:41'),(307,20,'Odometer','/uploads/vehicles/1789384000124-138922336.jpg',0,'2026-09-14 11:06:41'),(308,20,'Engine','/uploads/vehicles/1789384000165-629948826.jpg',0,'2026-09-14 11:06:41'),(309,20,'Dashboard','/uploads/vehicles/1789384000131-256994560.jpg',0,'2026-09-14 11:06:41'),(310,20,'Document - Service History','/uploads/vehicles/1789384001180-839438968.jpg',0,'2026-09-14 11:06:41'),(311,20,'Seat','/uploads/vehicles/1789384001021-388207974.jpg',0,'2026-09-14 11:06:41'),(312,20,'Dicky','/uploads/vehicles/1789384001107-771214012.jpg',0,'2026-09-14 11:06:41'),(313,21,'Front View','/uploads/vehicles/1789384272467-870442226.jpg',1,'2026-09-14 11:11:12'),(314,21,'Rear View','/uploads/vehicles/1789384272473-729161162.jpg',0,'2026-09-14 11:11:12'),(315,21,'Left Side','/uploads/vehicles/1789384272496-659019685.jpg',0,'2026-09-14 11:11:12'),(316,21,'Right Side','/uploads/vehicles/1789384272518-162414817.jpg',0,'2026-09-14 11:11:12'),(317,21,'Odometer','/uploads/vehicles/1789384272580-163144083.jpg',0,'2026-09-14 11:11:12'),(318,21,'Engine','/uploads/vehicles/1789384272580-753662358.jpg',0,'2026-09-14 11:11:12'),(319,21,'Seat','/uploads/vehicles/1789384272614-885880812.jpg',0,'2026-09-14 11:11:12'),(320,21,'Dicky','/uploads/vehicles/1789384272629-191999444.jpg',0,'2026-09-14 11:11:12'),(321,21,'Document - RC','/uploads/vehicles/1789384272646-421126928.png',0,'2026-09-14 11:11:12'),(322,21,'Interior','/uploads/vehicles/1789384272568-762465031.jpg',0,'2026-09-14 11:11:12'),(323,21,'Dashboard','/uploads/vehicles/1789384272580-996289144.jpg',0,'2026-09-14 11:11:12'),(324,21,'Engine Video','/uploads/vehicles/1789384272667-11590999.webm',0,'2026-09-14 11:11:12'),(325,21,'Engine Blow By Video','/uploads/vehicles/1789384272667-551883685.webm',0,'2026-09-14 11:11:12'),(326,21,'Test Drive Photo 1','/uploads/vehicles/1789384272667-700805216.jpg',0,'2026-09-14 11:11:12'),(327,21,'Test Drive Photo 2','/uploads/vehicles/1789384272669-518790690.jpg',0,'2026-09-14 11:11:12'),(328,21,'Test Drive Video','/uploads/vehicles/1789384272670-610806188.webm',0,'2026-09-14 11:11:12'),(329,22,'Front View','/uploads/vehicles/1789459133410-843135864.jpg',1,'2026-09-15 07:58:53'),(330,22,'Rear View','/uploads/vehicles/1789459133418-825665859.jpg',0,'2026-09-15 07:58:53'),(331,22,'Right Side','/uploads/vehicles/1789459133424-187685127.jpg',0,'2026-09-15 07:58:53'),(332,22,'Left Side','/uploads/vehicles/1789459133421-89097151.jpg',0,'2026-09-15 07:58:53'),(333,22,'Interior','/uploads/vehicles/1789459133426-774067745.jpg',0,'2026-09-15 07:58:53'),(334,22,'Dashboard','/uploads/vehicles/1789459133426-235948012.jpg',0,'2026-09-15 07:58:53'),(335,22,'Seat','/uploads/vehicles/1789459133429-669111369.jpg',0,'2026-09-15 07:58:53'),(336,22,'Engine','/uploads/vehicles/1789459133426-428990696.jpg',0,'2026-09-15 07:58:53'),(337,22,'Odometer','/uploads/vehicles/1789459133426-595616750.jpg',0,'2026-09-15 07:58:53'),(338,22,'Dicky','/uploads/vehicles/1789459133429-711777144.jpg',0,'2026-09-15 07:58:53'),(339,22,'Engine Video','/uploads/vehicles/1789459133525-858703244.webm',0,'2026-09-15 07:58:53'),(340,22,'Engine Blow By Video','/uploads/vehicles/1789459133526-19089262.webm',0,'2026-09-15 07:58:53'),(341,22,'Test Drive Photo 2','/uploads/vehicles/1789459133539-502848075.jpg',0,'2026-09-15 07:58:53'),(342,22,'Test Drive Photo 1','/uploads/vehicles/1789459133526-898475197.jpg',0,'2026-09-15 07:58:53'),(343,22,'Test Drive Video','/uploads/vehicles/1789459133553-328095103.webm',0,'2026-09-15 07:58:53'),(344,22,'Document - Duplicate Key','/uploads/vehicles/1789459133430-541346740.png',0,'2026-09-15 07:58:53');
/*!40000 ALTER TABLE `car_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars` (
  `car_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `variant` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `variant_short_note` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manufacturing_year` year DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `price_short_note` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transmission` enum('Manual','Automatic','AMT','CVT','DCT') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fuel_type` enum('Petrol','Diesel','CNG','Petrol + CNG','Electric','Hybrid') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner_classification` enum('First','Second','Third','Fourth') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `registration_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `chassis_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `engine_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inspection_date` date DEFAULT NULL,
  `rto` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `registration_rto_short_note` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `spare_key` enum('Yes','No') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `insurance_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `insurance_validity` date DEFAULT NULL,
  `vehicle_note` text COLLATE utf8mb4_general_ci,
  `status` enum('Draft','Published','Available','Sold','Inactive') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`car_id`),
  KEY `idx_cars_owner_id` (`owner_id`),
  KEY `idx_cars_booking_id` (`booking_id`),
  CONSTRAINT `fk_cars_booking` FOREIGN KEY (`booking_id`) REFERENCES `inspection_bookings` (`booking_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cars_owner` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`owner_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cars`
--

LOCK TABLES `cars` WRITE;
/*!40000 ALTER TABLE `cars` DISABLE KEYS */;
INSERT INTO `cars` VALUES (10,NULL,10,'Tata','Nexon','Creative dca',NULL,2026,NULL,NULL,20,'Dehradun ','Automatic','Petrol','First','XXXXX0001','MAT627658TLD37162','Revtrnxma8574','2026-09-11','Dehradun ',NULL,'Yes','Zero Depreciation','2027-09-11',NULL,'Draft','2026-09-11 10:35:06','2026-09-11 10:35:06',NULL),(15,NULL,15,'Honda ','Jazz','Zxi','',2022,320000.00,'',36000,NULL,'Automatic','Petrol + CNG','Second','UP16 KA 4645','JSBDHDBDISNN','BSHSINDHISB','2026-09-12',NULL,'','Yes','Comprehensive','2026-09-27',NULL,'Published','2026-09-12 09:43:01','2026-09-12 12:57:57','2026-09-12 12:57:57'),(16,NULL,16,'honda','city','g8',NULL,2026,900000.00,NULL,8898,'gwalior','Manual','Petrol','First','MPO9MR8998','473938nfi748949','8898rj63ni9','2026-12-31',NULL,NULL,'Yes','Comprehensive','2026-12-30',NULL,'Published','2026-09-13 09:09:11','2026-09-13 10:05:37','2026-09-13 10:05:37'),(17,NULL,17,'Maruti ','Swift ','Vxi',NULL,2021,640000.00,NULL,52000,'Noida ','Automatic','Petrol','First','DL07BT5578','Bdhdjdjskk','Sbdbddbhdhd','2026-09-14',NULL,NULL,'Yes','Comprehensive','2026-09-17',NULL,'Published','2026-09-13 16:40:05','2026-09-13 16:42:55','2026-09-13 16:42:55'),(18,NULL,18,'maruti','swift','vi9',NULL,2026,NULL,NULL,7898,'gwalior','Manual','Petrol','First','MP10MR8939','9889fdn989','899j8vhd89','2026-12-31',NULL,NULL,'Yes','Comprehensive','2026-12-31',NULL,'Draft','2026-09-13 17:54:08','2026-09-13 17:54:08',NULL),(20,26,20,'honda ','amaze','ci',NULL,2026,NULL,NULL,83893,'gwalior','Manual','Petrol','First','MP09MU8989','898898dsx934e4','778sd798sd','2026-12-31',NULL,NULL,'Yes','Comprehensive','2026-12-31',NULL,'Draft','2026-09-14 11:06:41','2026-09-14 11:06:41',NULL),(21,27,21,'audi','a9','k',NULL,2026,1000000.00,NULL,89,'gwalior','Manual','Petrol','First','MP09MI8990','898998dshj90','8989df89jk09','2026-12-31',NULL,NULL,'Yes','Comprehensive','2026-12-31',NULL,'Published','2026-09-14 11:11:12','2026-09-14 11:12:08','2026-09-14 11:12:08'),(22,28,22,'maruti','swift','vxi',NULL,2026,NULL,NULL,4565,'gwalior','Manual','Petrol','First','MP07BH5657','6767gf78yg874','455467fd','2026-12-31',NULL,NULL,'Yes','Comprehensive','2026-12-31',NULL,'Draft','2026-09-15 07:58:53','2026-09-15 07:58:53',NULL);
/*!40000 ALTER TABLE `cars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exchange_requests`
--

DROP TABLE IF EXISTS `exchange_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_requests` (
  `exchange_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `current_brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `current_model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `current_year` year DEFAULT NULL,
  `current_vehicle_price` decimal(12,2) DEFAULT NULL,
  `preferred_brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `preferred_model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `preferred_variant` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `vehicle_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exchange_requests`
--

LOCK TABLES `exchange_requests` WRITE;
/*!40000 ALTER TABLE `exchange_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `exchange_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_requests`
--

DROP TABLE IF EXISTS `finance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_requests` (
  `finance_id` int NOT NULL AUTO_INCREMENT,
  `car_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `occupation` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `down_payment` decimal(12,2) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`finance_id`),
  KEY `finance_requests_ibfk_1` (`car_id`),
  CONSTRAINT `finance_requests_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_requests`
--

LOCK TABLES `finance_requests` WRITE;
/*!40000 ALTER TABLE `finance_requests` DISABLE KEYS */;
INSERT INTO `finance_requests` VALUES (14,21,'gourav','8984989438','gourav@gmail.com','employee',100000.00,1000000.00,'Approved','2026-09-14 11:13:17');
/*!40000 ALTER TABLE `finance_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_bookings`
--

DROP TABLE IF EXISTS `inspection_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `vehicle_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `booking_date` date DEFAULT NULL,
  `time_slot` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_bookings`
--

LOCK TABLES `inspection_bookings` WRITE;
/*!40000 ALTER TABLE `inspection_bookings` DISABLE KEYS */;
INSERT INTO `inspection_bookings` VALUES (1,'gourav shrivas','8494738473','gouravshrivas0@gmail.com','gwalior','MP07MI9489','maruti','swift','line no 2','2026-09-09','09:00 AM - 11:00 AM','Approved','2026-09-09 05:11:47'),(2,'Sanjay','9425778827','Sanjay@gmail.com','Noida','UP93CJ4350','Honda','Jazz','Greater Noida','2026-09-09','03:00 PM - 05:00 PM','Approved','2026-09-09 09:56:02'),(3,'karan','9349043903','karan@gmail.com','gwalior','MP07MI9480','maruti','dzire','line','2026-09-09','09:00 AM - 11:00 AM','Approved','2026-09-09 10:16:17'),(4,'Nitesh Arya','9425778827','nitesh.arya94@gmail.com','Noida','UP16 AH 9846','Maruti  ','2018','Nodia Extension ','2026-09-09','03:00 PM - 05:00 PM','Approved','2026-09-09 10:24:47'),(5,'Nitesh','9425778827','nitesh.arya94@gmail.com','Noida','UP16 AH 9846','Maruti  ','2018','Nodia Extension ','2026-09-09','03:00 PM - 05:00 PM','Approved','2026-09-09 10:52:08'),(6,'nitin','9898398989','gouravshrivas0@gmail.com','gwalior','MP07MI9481','maruti','swift','loco','2026-09-09','09:00 AM - 11:00 AM','Approved','2026-09-09 11:20:15'),(7,'gourav shrivas','8934894389','gouravshrivas0@gmail.com','gwalior','MP07MI9482','maruti','swift','line','2026-09-09','09:00 AM - 11:00 AM','Approved','2026-09-09 15:24:05'),(8,'Nitesh Arya','9425778827','nitesh.arya94@gmail.com','Noida','UP16 AH 9846','Maruti  ','2018','Nodia Extension ','2026-09-09','03:00 PM - 05:00 PM','Pending','2026-09-09 15:40:10'),(9,'Nitesh Arya','9425778827','nitesh.arya94@gmail.com','Noida','UP16 AH 9846','Maruti  ','2018','Nodia Extension ','2026-09-09','03:00 PM - 05:00 PM','Pending','2026-09-09 15:54:03'),(10,'Sanjay','9425778827','nitesh.arya94@gmail.com','Noida','UP16 CJ 1466','Skoda','2018','Nodia Extension ','2026-12-23','09:00 AM - 11:00 AM','Pending','2026-09-10 13:06:15'),(11,'Santosh','9425778827','nitesh.arya94@gmail.com','Delhi','UP16 AH 9846','Maruti  ','2018','Mayur Vihar','2026-09-25','11:00 AM - 01:00 PM','Pending','2026-09-10 13:10:49'),(12,'abhi','9909349030','gouravshrivas0@gmail.com','gwalior','MP07MI9484','maruti','swift','line','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-10 14:00:05'),(13,'Nitesh Arya','9425778827','nitesh.arya94@gmail.com','Noida','UP16 AH 9846','Maruti  ','2018','Nodia Extension ','2026-09-18','09:00 AM - 11:00 AM','Pending','2026-09-10 15:17:09'),(14,'Nitesh Arya','9425778827','nitesh.arya94@gmail.com','Noida','UP16 CJ 1466','Maruti  ','2018','Nodia Extension ','2026-09-10','09:00 AM - 11:00 AM','Pending','2026-09-10 16:29:44'),(15,'Dr Moriya ','7500663355','semwalaayush552@gmail.com','Derdhuna ','XXXXX0001','Tata','Nexon','Tata aberai isbt derdhuna ','2026-09-11','11:00 AM - 01:00 PM','Approved','2026-09-11 08:08:21'),(16,'shiva','8998899838','gouravshrivas0@gmail.com','bhopal','MP07MI9487','maruti','swift','new ','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-11 11:34:36'),(17,'shiv','9889898439','gouravshrivas0@gmail.com','gwalior','MP07MI9483','maruti','swift','lane','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-11 11:51:58'),(18,'tarun','9090990900','gouravshrivas0@gmail.com','gwalior','MP07MI9482','maruti','M4','lane','2026-12-31','09:00 AM - 11:00 AM','Pending','2026-09-11 12:07:30'),(19,'Deepak','9329833404','niteshkarya89@gmail.com','Noida','UP16 KA 4645','Honda','Jazz','Noida extension ','2026-09-12','09:00 AM - 11:00 AM','Pending','2026-09-12 09:16:19'),(20,'Jabdhd','9876451230','nomail@gmail.com','Noida','UP16 KA 4645','Honda','Jazz','Noida extension ','2026-09-19','11:00 AM - 01:00 PM','Approved','2026-09-12 09:53:58'),(21,'gourav shrivas','8989898989','gouravshrivas0@gmail.com','gwalior','MPO9MR8998','maruti','swift','line no 2','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-13 03:36:37'),(22,'Neelam','1234567890','pramendraverma@gmail.com','Noida','DL07BT5578','Maruti ','Swift','Greater Noida ','2026-09-14','11:00 AM - 01:00 PM','Approved','2026-09-13 16:28:58'),(23,'Umesh Yadav','9773684629','sukhiramyadav770@gmail.com','New Delhi','DL12UME2000','Audi ','A4 ','S- 15, Sri Aurobindo Marg, Block A, Green Park','2026-09-14','09:00 AM - 11:00 AM','Approved','2026-09-13 17:12:19'),(24,'shiva','9834893489','gouravshrivas0@gmail.com','gwalior','MP10MR8939','maruti','swift','loco','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-13 17:46:41'),(25,'tarun','8989984988','gouravshrivas0@gmail.com','gwalior','MP06MR7489','maruti','swift','tansen nagar','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-14 04:40:06'),(26,'varun','8989889898','gouravshrivas0@gmail.com','gwalior','MP09MU8989','maruti','swift','line','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-14 09:11:46'),(27,'shivam','8989898989','gouravshrivas0@gmail.com','gwalior','MP09MI8990','maruti','swift','hazira','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-14 09:12:24'),(28,'tarun','7786868689','gouravshrivas0@gmail.com','gwalior','MP07BH5657','maruti','swift','line','2026-12-31','09:00 AM - 11:00 AM','Approved','2026-09-15 07:51:27'),(29,'Sanjay','7828933404','nomail@gmail.com','Noida ','UP93AL3640','Maruti ','Swift ','Greater Noida ','2026-09-15','01:00 PM - 03:00 PM','Pending','2026-09-15 12:29:15');
/*!40000 ALTER TABLE `inspection_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_checklist`
--

DROP TABLE IF EXISTS `inspection_checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_checklist` (
  `checklist_id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `category` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `section` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `item_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('Good','Need Attention') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Good',
  `selected_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `remark` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`checklist_id`),
  KEY `idx_inspection_checklist_report_id` (`report_id`),
  CONSTRAINT `fk_inspection_checklist_report` FOREIGN KEY (`report_id`) REFERENCES `inspection_reports` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=571 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_checklist`
--

LOCK TABLES `inspection_checklist` WRITE;
/*!40000 ALTER TABLE `inspection_checklist` DISABLE KEYS */;
INSERT INTO `inspection_checklist` VALUES (562,99,'Exterior','','','Good','[]','','2026-09-12 12:51:36'),(563,99,'Interior & Electricals','','','Good','[]','','2026-09-12 12:51:36'),(564,99,'Engine Bay','','','Good','[]','','2026-09-12 12:51:36'),(565,99,'Transmission System','','','Good','[]','','2026-09-12 12:51:36'),(566,99,'Suspension & Steering','','','Good','[]','','2026-09-12 12:51:36'),(567,99,'Braking System','','','Good','[]','','2026-09-12 12:51:36'),(568,99,'Tires & Wheels','','','Good','[]','','2026-09-12 12:51:36'),(569,99,'Electricals & AC','','','Good','[]','','2026-09-12 12:51:36'),(570,99,'Documents & Title','','','Good','[]','','2026-09-12 12:51:36');
/*!40000 ALTER TABLE `inspection_checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_reports`
--

DROP TABLE IF EXISTS `inspection_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `car_id` int DEFAULT NULL,
  `overall_score` decimal(3,1) DEFAULT NULL,
  `engine_remark` text COLLATE utf8mb4_general_ci,
  `overall_remark` text COLLATE utf8mb4_general_ci,
  `pdf_path` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `publish_status` enum('Yes','No') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'No',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_email_sent_at` datetime DEFAULT NULL,
  `customer_whatsapp_sent_at` datetime DEFAULT NULL,
  `admin_email_sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `idx_inspection_reports_car_id` (`car_id`),
  CONSTRAINT `fk_inspection_reports_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_reports`
--

LOCK TABLES `inspection_reports` WRITE;
/*!40000 ALTER TABLE `inspection_reports` DISABLE KEYS */;
INSERT INTO `inspection_reports` VALUES (94,10,10.0,'Excellent ','Excellent ','uploads/reports/car-10-inspection-report-94.pdf','No','2026-09-11 10:35:06',NULL,NULL,NULL),(99,15,90.0,'Ok','Ok','uploads/reports/car-15-inspection-report-99.pdf','Yes','2026-09-12 09:43:02',NULL,NULL,NULL),(100,16,10.0,'nice car','best','uploads/reports/car-16-inspection-report-100.pdf','Yes','2026-09-13 09:09:11',NULL,NULL,NULL),(101,17,9.0,'All ok','All done ','uploads/reports/car-17-inspection-report-101.pdf','Yes','2026-09-13 16:40:05',NULL,NULL,NULL),(102,18,9.0,'nice ','best','uploads/reports/car-18-inspection-report-102.pdf','No','2026-09-13 17:54:08',NULL,NULL,NULL),(104,20,9.0,'nice ','best','uploads/reports/car-20-inspection-report-104.pdf','No','2026-09-14 11:06:41',NULL,NULL,NULL),(105,21,8.0,'nice','best','uploads/reports/car-21-inspection-report-105.pdf','Yes','2026-09-14 11:11:12',NULL,NULL,NULL),(106,22,9.0,'nice','best','uploads/reports/car-22-inspection-report-106.pdf','No','2026-09-15 07:58:53',NULL,NULL,NULL);
/*!40000 ALTER TABLE `inspection_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspection_requests`
--

DROP TABLE IF EXISTS `inspection_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `report_id` int DEFAULT NULL,
  `status` enum('Assigned','Accepted','Rejected','In Progress','Submitted','Admin Rejected','Approved','Published') NOT NULL DEFAULT 'Assigned',
  `employee_remark` text,
  `admin_remark` text,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `admin_reviewed_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_inspection_requests_booking_id` (`booking_id`),
  KEY `idx_inspection_requests_employee_id` (`employee_id`),
  KEY `idx_inspection_requests_report_id` (`report_id`),
  KEY `idx_inspection_requests_status` (`status`),
  CONSTRAINT `fk_inspection_requests_booking` FOREIGN KEY (`booking_id`) REFERENCES `inspection_bookings` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inspection_requests_employee` FOREIGN KEY (`employee_id`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_inspection_requests_report` FOREIGN KEY (`report_id`) REFERENCES `inspection_reports` (`report_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspection_requests`
--

LOCK TABLES `inspection_requests` WRITE;
/*!40000 ALTER TABLE `inspection_requests` DISABLE KEYS */;
INSERT INTO `inspection_requests` VALUES (4,1,2,NULL,'Published','nice car',NULL,'2026-09-09 05:12:23','2026-09-09 05:12:39',NULL,'2026-09-09 05:12:42','2026-09-09 05:16:24','2026-09-09 05:16:52','2026-09-09 05:16:52','2026-09-09 05:17:13','2026-09-09 05:12:23','2026-09-09 05:17:13'),(5,2,4,NULL,'Published','Vehicle is all ok no major issue and condition is good',NULL,'2026-09-09 09:56:33','2026-09-09 09:57:05',NULL,'2026-09-09 09:57:09','2026-09-09 10:08:39','2026-09-09 10:10:51','2026-09-09 10:10:51','2026-09-09 11:27:32','2026-09-09 09:56:33','2026-09-09 11:27:32'),(6,3,2,NULL,'Published','nice car',NULL,'2026-09-09 10:16:40','2026-09-09 10:17:02',NULL,'2026-09-09 10:17:05','2026-09-09 11:00:54','2026-09-09 11:27:37','2026-09-09 11:27:37','2026-09-09 11:27:49','2026-09-09 10:16:40','2026-09-09 11:27:49'),(7,4,4,NULL,'Published','All Ok',NULL,'2026-09-09 10:25:52','2026-09-09 10:26:56',NULL,'2026-09-09 10:27:33','2026-09-09 10:35:40','2026-09-09 10:39:01','2026-09-09 10:39:01','2026-09-09 11:27:24','2026-09-09 10:25:52','2026-09-09 11:27:24'),(8,5,4,NULL,'Published','ok',NULL,'2026-09-09 10:53:30','2026-09-09 10:54:17',NULL,'2026-09-09 10:54:23','2026-09-09 10:58:31','2026-09-09 11:27:06','2026-09-09 11:27:06','2026-09-09 11:27:15','2026-09-09 10:53:30','2026-09-09 11:27:15'),(9,6,2,NULL,'Published','best car today',NULL,'2026-09-09 11:20:28','2026-09-09 11:21:28',NULL,'2026-09-09 11:21:32','2026-09-09 11:24:53','2026-09-09 11:26:33','2026-09-09 11:26:33','2026-09-09 11:26:55','2026-09-09 11:20:28','2026-09-09 11:26:55'),(10,7,2,NULL,'Published','nice car',NULL,'2026-09-09 15:24:47','2026-09-09 15:25:14',NULL,'2026-09-09 15:25:16','2026-09-09 15:27:58','2026-09-09 15:28:34','2026-09-09 15:28:34','2026-09-09 15:28:48','2026-09-09 15:24:47','2026-09-09 15:28:48'),(11,8,4,NULL,'Published','ok',NULL,'2026-09-09 15:41:18','2026-09-09 15:41:47',NULL,'2026-09-09 15:41:53','2026-09-09 16:56:39','2026-09-09 16:57:27','2026-09-09 16:57:27','2026-09-09 16:58:18','2026-09-09 15:41:18','2026-09-09 16:58:18'),(12,9,4,NULL,'In Progress',NULL,NULL,'2026-09-09 15:55:02','2026-09-10 11:34:59',NULL,'2026-09-10 11:35:07',NULL,NULL,NULL,NULL,'2026-09-09 15:55:02','2026-09-10 11:35:07'),(13,10,4,NULL,'Published','ok',NULL,'2026-09-10 13:07:25','2026-09-10 13:08:10',NULL,'2026-09-10 13:14:05','2026-09-10 13:23:39','2026-09-10 13:28:25','2026-09-10 13:28:25','2026-09-10 13:51:31','2026-09-10 13:07:25','2026-09-10 13:51:31'),(14,11,4,NULL,'In Progress',NULL,NULL,'2026-09-10 13:11:13','2026-09-10 16:31:26',NULL,'2026-09-10 16:31:30',NULL,NULL,NULL,NULL,'2026-09-10 13:11:13','2026-09-10 16:31:30'),(15,12,2,NULL,'Admin Rejected','nice car','reject','2026-09-10 14:00:29','2026-09-10 14:01:00',NULL,'2026-09-10 14:01:03','2026-09-11 11:17:40','2026-09-11 12:15:11',NULL,NULL,'2026-09-10 14:00:29','2026-09-11 12:15:11'),(16,13,5,NULL,'In Progress',NULL,NULL,'2026-09-10 15:18:59','2026-09-10 15:19:28',NULL,'2026-09-10 15:19:38',NULL,NULL,NULL,NULL,'2026-09-10 15:18:59','2026-09-10 15:19:38'),(17,15,6,94,'Submitted',NULL,NULL,'2026-09-11 08:10:44','2026-09-11 08:16:04',NULL,'2026-09-11 09:22:52','2026-09-11 10:35:06',NULL,NULL,NULL,'2026-09-11 08:10:44','2026-09-11 10:35:06'),(18,16,2,NULL,'Admin Rejected','nice car','rejct\\]\\','2026-09-11 11:35:08','2026-09-11 11:35:33',NULL,'2026-09-11 11:35:35','2026-09-11 11:39:18','2026-09-11 12:14:58',NULL,NULL,'2026-09-11 11:35:08','2026-09-11 12:14:58'),(19,17,2,NULL,'Admin Rejected','nice car','reject','2026-09-11 11:52:19','2026-09-11 11:52:41',NULL,'2026-09-11 11:52:43','2026-09-11 11:57:00','2026-09-11 12:14:40',NULL,NULL,'2026-09-11 11:52:19','2026-09-11 12:14:40'),(20,18,2,NULL,'Admin Rejected','nice car sir','reject','2026-09-11 12:07:50','2026-09-11 12:08:07',NULL,'2026-09-11 12:08:11','2026-09-11 12:13:11','2026-09-11 12:14:29',NULL,NULL,'2026-09-11 12:07:50','2026-09-11 12:14:29'),(21,19,4,99,'Published','Ok',NULL,'2026-09-12 09:19:07','2026-09-12 09:22:14',NULL,'2026-09-12 09:22:59','2026-09-12 09:43:02','2026-09-12 12:57:30','2026-09-12 12:57:30','2026-09-12 12:57:57','2026-09-12 09:19:07','2026-09-12 12:57:57'),(22,20,4,NULL,'In Progress',NULL,NULL,'2026-09-12 09:55:18','2026-09-12 09:55:40',NULL,'2026-09-12 09:55:45',NULL,NULL,NULL,NULL,'2026-09-12 09:55:18','2026-09-12 09:55:45'),(23,21,2,100,'Published','nice car',NULL,'2026-09-13 03:37:06','2026-09-13 03:37:28',NULL,'2026-09-13 03:37:40','2026-09-13 09:09:11','2026-09-13 09:10:37','2026-09-13 09:10:37','2026-09-13 10:05:37','2026-09-13 03:37:06','2026-09-13 10:05:37'),(24,22,4,101,'Published','Ok',NULL,'2026-09-13 16:29:35','2026-09-13 16:30:10',NULL,'2026-09-13 16:30:15','2026-09-13 16:40:05','2026-09-13 16:42:14','2026-09-13 16:42:14','2026-09-13 16:42:55','2026-09-13 16:29:35','2026-09-13 16:42:55'),(25,23,5,NULL,'In Progress',NULL,NULL,'2026-09-13 17:12:45','2026-09-13 17:13:22',NULL,'2026-09-13 17:13:27',NULL,NULL,NULL,NULL,'2026-09-13 17:12:45','2026-09-13 17:13:27'),(26,24,2,102,'Admin Rejected','nice car','fill rc','2026-09-13 17:47:07','2026-09-13 17:50:11',NULL,'2026-09-13 17:50:15','2026-09-13 17:54:08','2026-09-13 17:54:46',NULL,NULL,'2026-09-13 17:47:07','2026-09-13 17:54:46'),(27,25,2,NULL,'Published','nice car',NULL,'2026-09-14 04:40:57','2026-09-14 04:41:15',NULL,'2026-09-14 04:41:18','2026-09-14 08:00:27','2026-09-14 08:01:01','2026-09-14 08:01:01','2026-09-14 08:01:12','2026-09-14 04:40:57','2026-09-14 08:01:12'),(28,27,2,105,'Published','my refer',NULL,'2026-09-14 09:13:01','2026-09-14 09:14:19',NULL,'2026-09-14 09:14:27','2026-09-14 11:11:12','2026-09-14 11:11:49','2026-09-14 11:11:49','2026-09-14 11:12:08','2026-09-14 09:13:01','2026-09-14 11:12:08'),(29,26,2,104,'Submitted','nice car',NULL,'2026-09-14 09:13:15','2026-09-14 09:14:16',NULL,'2026-09-14 09:14:21','2026-09-14 11:06:41',NULL,NULL,NULL,'2026-09-14 09:13:15','2026-09-14 11:06:41'),(30,28,2,106,'Submitted','nice car',NULL,'2026-09-15 07:51:53','2026-09-15 07:52:38',NULL,'2026-09-15 07:52:42','2026-09-15 07:58:53',NULL,NULL,NULL,'2026-09-15 07:51:53','2026-09-15 07:58:53'),(31,29,4,NULL,'In Progress',NULL,NULL,'2026-09-15 12:30:32','2026-09-15 12:31:24',NULL,'2026-09-15 12:31:32',NULL,NULL,NULL,NULL,'2026-09-15 12:30:32','2026-09-15 12:31:32');
/*!40000 ALTER TABLE `inspection_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_requests`
--

DROP TABLE IF EXISTS `loan_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_requests` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employment_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `vehicle_required` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `car_model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`loan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_requests`
--

LOCK TABLES `loan_requests` WRITE;
/*!40000 ALTER TABLE `loan_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `owner_id` int NOT NULL AUTO_INCREMENT,
  `owner_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `alternate_mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `aadhar_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`owner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES (1,'gourav shrivas','8494738473','','gouravshrivas0@gmail.com','line no 2','','','','','','2026-09-09 05:16:22'),(2,'Sanjay','9425778827','','Sanjay@gmail.com','Greater Noida','','','','','','2026-09-09 10:08:33'),(3,'Nitesh Arya','9425778827','','nitesh.arya94@gmail.com','Nodia Extension ','','','','','','2026-09-09 10:35:35'),(4,'Nitesh','9425778827','','nitesh.arya94@gmail.com','Nodia Extension ','','','','','','2026-09-09 10:58:26'),(5,'karan','9349043903',NULL,'karan@gmail.com','line',NULL,NULL,NULL,NULL,NULL,'2026-09-09 11:00:52'),(6,'nitin','9898398989',NULL,'gouravshrivas0@gmail.com','loco',NULL,NULL,NULL,NULL,NULL,'2026-09-09 11:24:52'),(7,'gourav shrivas','8934894389',NULL,'gouravshrivas0@gmail.com','line',NULL,NULL,NULL,NULL,NULL,'2026-09-09 15:27:56'),(8,'Nitesh Arya','9425778827',NULL,'nitesh.arya94@gmail.com','Nodia Extension ',NULL,NULL,NULL,NULL,NULL,'2026-09-09 16:56:33'),(9,'Sanjay','9425778827',NULL,'nitesh.arya94@gmail.com','Nodia Extension ',NULL,NULL,NULL,NULL,NULL,'2026-09-10 13:23:33'),(10,'Dr Moriya ','7500663355',NULL,'semwalaayush552@gmail.com','Tata aberai isbt derdhuna ',NULL,NULL,NULL,NULL,NULL,'2026-09-11 10:35:06'),(11,'abhi','9909349030',NULL,'gouravshrivas0@gmail.com','line',NULL,NULL,NULL,NULL,NULL,'2026-09-11 11:17:40'),(12,'shiva','8998899838',NULL,'gouravshrivas0@gmail.com','new ',NULL,NULL,NULL,NULL,NULL,'2026-09-11 11:39:18'),(13,'shiv','9889898439',NULL,'gouravshrivas0@gmail.com','lane',NULL,NULL,NULL,NULL,NULL,'2026-09-11 11:57:00'),(14,'tarun','9090990900',NULL,'gouravshrivas0@gmail.com','lane',NULL,NULL,NULL,NULL,NULL,'2026-09-11 12:13:11'),(15,'Deepak','9329833404','','niteshkarya89@gmail.com','Noida extension ','','','','','','2026-09-12 09:43:02'),(16,'gourav shrivas','8989898989',NULL,'gouravshrivas0@gmail.com','line no 2',NULL,NULL,NULL,NULL,NULL,'2026-09-13 09:09:11'),(17,'Neelam','1234567890',NULL,'pramendraverma@gmail.com','Greater Noida ',NULL,NULL,NULL,NULL,NULL,'2026-09-13 16:40:05'),(18,'shiva','9834893489',NULL,'gouravshrivas0@gmail.com','loco',NULL,NULL,NULL,NULL,NULL,'2026-09-13 17:54:08'),(19,'tarun','8989984988',NULL,'gouravshrivas0@gmail.com','tansen nagar',NULL,NULL,NULL,NULL,NULL,'2026-09-14 08:00:27'),(20,'varun','8989889898',NULL,'gouravshrivas0@gmail.com','line',NULL,NULL,NULL,NULL,NULL,'2026-09-14 11:06:41'),(21,'shivam','8989898989',NULL,'gouravshrivas0@gmail.com','hazira',NULL,NULL,NULL,NULL,NULL,'2026-09-14 11:11:12'),(22,'tarun','7786868689',NULL,'gouravshrivas0@gmail.com','line',NULL,NULL,NULL,NULL,NULL,'2026-09-15 07:58:53');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_unlock_requests`
--

DROP TABLE IF EXISTS `report_unlock_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_unlock_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `car_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `report_unlock_requests_ibfk_1` (`car_id`),
  CONSTRAINT `report_unlock_requests_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_unlock_requests`
--

LOCK TABLES `report_unlock_requests` WRITE;
/*!40000 ALTER TABLE `report_unlock_requests` DISABLE KEYS */;
INSERT INTO `report_unlock_requests` VALUES (10,15,'Nitesh','9425778827','nomail@gmail.com','Pending','2026-09-12 12:59:12'),(11,15,'Nitesh','9425778827','nomail@gmail.com','Approved','2026-09-12 12:59:49'),(12,15,'Nitesh','9425778827','niteshkarya89@gmail.com','Approved','2026-09-12 13:02:26'),(13,16,'Nitesh','9988998899','nomail@gmail.com','Approved','2026-09-13 14:58:15'),(15,21,'gourav','8943984389','gourav@gmial.co','Approved','2026-09-14 11:13:34');
/*!40000 ALTER TABLE `report_unlock_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sell_car_requests`
--

DROP TABLE IF EXISTS `sell_car_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sell_car_requests` (
  `sell_id` int NOT NULL AUTO_INCREMENT,
  `seller_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `variant` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manufacturing_year` year DEFAULT NULL,
  `fuel_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transmission` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `km_driven` int DEFAULT NULL,
  `expected_price` decimal(12,2) DEFAULT NULL,
  `front_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `back_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `left_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `right_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sell_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sell_car_requests`
--

LOCK TABLES `sell_car_requests` WRITE;
/*!40000 ALTER TABLE `sell_car_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `sell_car_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_drive_requests`
--

DROP TABLE IF EXISTS `test_drive_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_drive_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `car_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `test_drive_requests_ibfk_1` (`car_id`),
  CONSTRAINT `test_drive_requests_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_drive_requests`
--

LOCK TABLES `test_drive_requests` WRITE;
/*!40000 ALTER TABLE `test_drive_requests` DISABLE KEYS */;
INSERT INTO `test_drive_requests` VALUES (13,21,'gourav','8943894983','gourav@gmail.com','gwalior','2026-12-31','23:59','Approved','2026-09-14 11:14:00'),(14,21,'gourav','8943894983','gourav@gmail.com','gwalior','2026-12-31','23:59','Rejected','2026-09-14 11:14:00'),(15,21,'gourav','8938023900','gourav@gmail.com','gwalior','2026-12-31','23:59','Approved','2026-09-14 11:14:56');
/*!40000 ALTER TABLE `test_drive_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'railway'
--

--
-- Dumping routines for database 'railway'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-15 18:55:24
