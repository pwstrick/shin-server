&emsp;&emsp;shin 的读音是[ʃɪn]，谐音就是行，寓意可行的后端系统服务，它的特点是：

* 站在巨人的肩膀上，依托[KOA2](https://github.com/demopark/koa-docs-Zh-CN)、[bunyan](https://github.com/trentm/node-bunyan)、[Sequelize](https://www.sequelize.com.cn/)等优秀的框架和库所搭建的定制化后端系统服务。
* 调试便捷，实时打印出各类请求、日志和所有的查询语句。
* 配合独立的配置文件可连接 MongoDB、MySQL 以及 Redis。
* 已开辟脚本和定时任务目录，可将相应文件补充进来。
* 容易扩展，可引入第三方库，例如队列、云服务等。

&emsp;&emsp;与[shin-admin](https://github.com/pwstrick/shin-admin)配合使用的话，大致架构如下图。

![架构](https://github.com/pwstrick/shin-server/blob/main/docs/assets/architecture.png)

# 准备工作
#### 1）安装
&emsp;&emsp;在将项目下载下来后，来到其根目录，运行安装命令，自动将依赖包下载到本地。
```bash
$ npm install
```

#### 2）启动
&emsp;&emsp;在启动服务器之前，需要确保本地已经安装并已开启 MongoDB、MySQL 以及 Redis。
* mongo 启动命令：mongod
* redis 启动命令：redis-server

&emsp;&emsp;执行项目启动命令，成功后的终端如下图所示。
```bash
$ npm start
```
![启动](https://github.com/pwstrick/shin-server/blob/main/docs/assets/1.png)

#### 4）运行流程
&emsp;&emsp;当向这套后端系统服务请求一个接口时，其大致流程如下图所示。
![shin](https://github.com/pwstrick/shin-server/blob/main/docs/assets/shin.png)

# 目录结构

# 开发流程

# 定时任务

# 单元测试