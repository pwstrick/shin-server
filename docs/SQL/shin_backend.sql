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

DROP TABLE IF EXISTS `web_monitor`;
CREATE TABLE `web_monitor` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `project` varchar(45) COLLATE utf8mb4_bin NOT NULL COMMENT '项目名称',
  `project_subdir` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '项目的子目录，shin-h5项目下会有很多活动，放置在各个子目录中',
  `digit` int(11) NOT NULL DEFAULT '1' COMMENT '出现次数',
  `message` text COLLATE utf8mb4_bin NOT NULL COMMENT '聚合信息',
  `ua` varchar(600) COLLATE utf8mb4_bin NOT NULL COMMENT '代理信息',
  `key` varchar(45) COLLATE utf8mb4_bin NOT NULL COMMENT '去重用的标记',
  `category` varchar(45) COLLATE utf8mb4_bin NOT NULL COMMENT '日志类型',
  `source` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'SourceMap映射文件的地址',
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `identity` varchar(20) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '身份，用于连贯日志上下文',
  `day` int(11) DEFAULT NULL COMMENT '格式化的天（冗余字段），用于排序，20210322',
  `hour` tinyint(2) DEFAULT NULL COMMENT '格式化的小时（冗余字段），用于分组，11',
  `minute` tinyint(2) DEFAULT NULL COMMENT '格式化的分钟（冗余字段），用于分组，20',
  `message_status` int(11) DEFAULT NULL COMMENT 'message中的通信状态码',
  `message_path` varchar(45) COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'message通信中的 path',
  `message_type` varchar(20) COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'message中的类别字段',
  PRIMARY KEY (`id`),
  KEY `idx_key_category_project_identity` (`key`,`category`,`project`,`identity`),
  KEY `idx_category_project_identity` (`category`,`project`,`identity`),
  KEY `index_ctime` (`ctime`),
  KEY `index_ctime_category` (`ctime`,`category`),
  KEY `idx_category_project_ctime` (`category`,`project`,`ctime`),
  KEY `idx_messagepath` (`message_path`),
  KEY `idx_category_messagetype_ctime` (`category`,`message_type`,`ctime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='前端监控日志';

DROP TABLE IF EXISTS `web_monitor_statis`;
CREATE TABLE `web_monitor_statis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) NOT NULL COMMENT '日期，格式为20210318，一天只存一条记录',
  `statis` text COLLATE utf8mb4_bin NOT NULL COMMENT '以JSON格式保存的统计信息',
  PRIMARY KEY (`id`),
  UNIQUE KEY `date_UNIQUE` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='前端监控日志统计信息表';

DROP TABLE IF EXISTS `web_performance`;
CREATE TABLE `web_performance` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `load` int(11) NOT NULL DEFAULT '0' COMMENT '页面加载总时间',
  `ready` int(11) NOT NULL DEFAULT '0' COMMENT '用户可操作时间',
  `paint` int(11) NOT NULL DEFAULT '0' COMMENT '白屏时间',
  `screen` int(11) NOT NULL DEFAULT '0' COMMENT '首屏时间',
  `measure` varchar(1000) COLLATE utf8mb4_bin NOT NULL COMMENT '其它测量参数，用JSON格式保存',
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `day` int(11) NOT NULL COMMENT '格式化的天（冗余字段），用于排序，20210322',
  `hour` tinyint(2) NOT NULL COMMENT '格式化的小时（冗余字段），用于分组，11',
  `minute` tinyint(2) DEFAULT NULL COMMENT '格式化的分钟（冗余字段），用于分组，20',
  `identity` varchar(20) COLLATE utf8mb4_bin NOT NULL COMMENT '身份',
  `project` varchar(20) COLLATE utf8mb4_bin NOT NULL COMMENT '项目关键字，关联 web_performance_project 表中的key',
  `ua` varchar(600) COLLATE utf8mb4_bin NOT NULL COMMENT '代理信息',
  `referer` varchar(200) COLLATE utf8mb4_bin DEFAULT NULL COMMENT '来源地址',
  `timing` text COLLATE utf8mb4_bin COMMENT '浏览器读取到的性能参数，用于排查',
  `resource` text COLLATE utf8mb4_bin COMMENT '静态资源信息',
  PRIMARY KEY (`id`),
  KEY `idx_project_day` (`project`,`day`),
  KEY `idx_project_day_hour` (`project`,`day`,`hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='性能监控';

DROP TABLE IF EXISTS `web_performance_project`;
CREATE TABLE `web_performance_project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(20) COLLATE utf8mb4_bin NOT NULL COMMENT '唯一值',
  `name` varchar(45) COLLATE utf8mb4_bin NOT NULL COMMENT '项目名称',
  `ctime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1：正常  0：删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='性能监控项目';

DROP TABLE IF EXISTS `web_performance_statis`;
CREATE TABLE `web_performance_statis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` int(11) NOT NULL COMMENT '日期，格式为20210318',
  `statis` mediumtext COLLATE utf8mb4_bin NOT NULL COMMENT '以JSON格式保存的统计信息',
  `project` varchar(20) COLLATE utf8mb4_bin NOT NULL COMMENT '项目关键字，关联 web_performance_project 表中的key',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='性能监控统计';