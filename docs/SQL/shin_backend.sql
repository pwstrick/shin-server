CREATE DATABASE  IF NOT EXISTS `shin_backend` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `shin_backend`;

DROP TABLE IF EXISTS `app_global_config`;
CREATE TABLE `app_global_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(60) COLLATE utf8mb4_bin NOT NULL COMMENT '标题',
  `content` text COLLATE utf8mb4_bin NOT NULL COMMENT 'JSON格式的内容',
  `key` varchar(40) COLLATE utf8mb4_bin NOT NULL COMMENT '唯一标识',
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(4) DEFAULT '1' COMMENT '状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_UNIQUE` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='全局通用配置';

DROP TABLE IF EXISTS `web_short_chain`;
CREATE TABLE `web_short_chain` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `short` varchar(10) COLLATE utf8mb4_bin NOT NULL COMMENT '短链地址中的key',
  `url` varchar(200) COLLATE utf8mb4_bin NOT NULL COMMENT '原始地址',
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mtime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `short_UNIQUE` (`short`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='短链存储';

