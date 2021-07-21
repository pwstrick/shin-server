# shin-server
&emsp;&emsp;shin 的读音是[ʃɪn]，谐音就是行，寓意可行的后端系统服务，它的特点是：

* 站在巨人的肩膀上，依托[KOA2](https://github.com/demopark/koa-docs-Zh-CN)、[bunyan](https://github.com/trentm/node-bunyan)、[Sequelize](https://www.sequelize.com.cn/)等优秀的框架和库所搭建的定制化后端系统服务。
* 一套完整的 Node.js 后端服务解决方案。
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

&emsp;&emsp;在 docs/SQL 中有个数据库文件，可初始化所需的表，并且注意将 config/development.js 中数据库的账号和密码修改成本机的。

&emsp;&emsp;执行项目启动命令，成功后的终端如下图所示，端口号默认是 6060，可在 config/development.js 中自定义端口号。
```bash
$ npm start
```
![启动](https://github.com/pwstrick/shin-server/blob/main/docs/assets/1.png)

&emsp;&emsp;运行 http://localhost:6060/user/init 可初始化超级管理员账号，后台账号和权限都保存在 MongoDB 中，其他一些业务保存在 MySQL 中。
* 账号：admin@shin.com
* 密码：admin

#### 3）运行流程
&emsp;&emsp;当向这套后端系统服务请求一个接口时，其大致流程如下图所示。

<p align="center">
  <img src="https://github.com/pwstrick/shin-server/blob/main/docs/assets/shin.png" width="700"/>
</p>

# 目录结构
```
├── shin-server
│   ├── config --------------------------------- 全局配置文件
│   ├── db ------------------------------------- 数据库连接
│   ├── docs ----------------------------------- 说明文档
│   ├── middlewares ---------------------------- 自定义的中间件
│   ├── models --------------------------------- 数据表映射
│   ├── routers -------------------------------- api 路由层
│   ├── scripts -------------------------------- 脚本文件
│   ├── services ------------------------------- api 服务层
│   ├── static --------------------------------- 静态资源
│   ├── test ----------------------------------- 单元测试
│   ├── utils ---------------------------------- 公用工具
│   ├── worker --------------------------------- 定时任务
│   ├── app.js --------------------------------- 启动文件
│   ├── index.js ------------------------------- 入口文件
└───└── index-worker.js ------------------------ 任务的入口文件
```

#### 1）app.js
&emsp;&emsp;在启动文件中，初始化了 [bunyan](https://github.com/trentm/node-bunyan) 日志框架，并声明了一个全局的 logger 变量（可调用的方法包括 info、error、warn、debug等） ，可随时写日志，所有的请求信息（引入了[koa-bunyan-logger](https://github.com/koajs/bunyan-logger)）、数据库查询语句、响应数据等，都会写入到服务器的日志中。

&emsp;&emsp;[JWT](https://jwt.io/) 认证 HTTP 请求，引入了 koa-jwt 中间件，会在 checkAuth.js 中间件（如下代码所示）中调用 ctx.state.user，以此来判断权限。而判断当前是否是登录会以 GET 方式向 ”api/user“ 接口发送一次请求。

&emsp;&emsp;还引入了 routers() 函数（位于 routers 目录的 index.js 中），将 services 和 middlewares 两个目录下的文件作为参数传入，这两个目录下都包含 index.js 文件，引用方式为 middlewares.checkAuth()、 services.android 等。
```javascript
import requireIndex from 'es6-requireindex';
import services from '../services/';
import middlewares from '../middlewares';
 
export default (router) => {
  const dir = requireIndex(__dirname);
  Object.keys(dir).forEach((item) => {
    dir[item](router, services, middlewares);
  });
};
```

#### 2）config
&emsp;&emsp;默认只包含 development.js，即开发环境的配置文件，可包含数据库的地址、各类账号密码等。

&emsp;&emsp;使用[node-config](https://lorenwest.github.io/node-config/)后，就能根据当前环境（NODE_ENV）调用相应名称的配置文件，例如 production.js、test.js 等。

#### 3）db
&emsp;&emsp;MySQL 数据库 ORM 系统采用的是 [Sequelize](https://www.sequelize.com.cn/)，MongoDB 数据库 ORM系统采用的是 [Mongoose](http://www.mongoosejs.net/docs/guide.html)，redis 库采用的是 [ioredis](https://github.com/luin/ioredis/blob/master/API.md)。

#### 4）models
&emsp;&emsp;声明各张表的结构，可用驼峰，也可用下划线的命名方式，函数的参数为 mysql 或 mongodb，可通过 mysql.backend 来指定要使用的数据库名称。
```javascript
export default ({ mysql }) =>
  mysql.backend.define("AppGlobalConfig",
    {
      id: {
        type: Sequelize.INTEGER,
        field: "id",
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        field: "title"
      },
    },
    {
      tableName: "app_global_config",
      timestamps: false
    }
);
```
&emsp;&emsp;models 目录中的 index.js 文件会将当前所有的 model 文件映射到一个 models 对象中。

#### 5）routers
&emsp;&emsp;前端访问的接口，在此目录下声明，此处代码相当于 MVC 中的 Control 层。

&emsp;&emsp;在下面的示例中，完成了一次 GET 请求，middlewares.checkAuth()用于检查权限，其值就是在 [authority.js](https://github.com/pwstrick/shin-admin#9authorityjs) 声明的 id，ctx.body 会返回响应。
```javascript
router.get(
  "/tool/short/query",
  middlewares.checkAuth("backend.tool.shortChain"),
  async (ctx) => {
    const { curPage = 1, short, url } = ctx.query;
    const { rows, count } = await services.tool.getShortChainList({
      curPage,
      short,
      url
    });
    ctx.body = { code: 0, data: rows, count };
  }
);
```

#### 6）services
&emsp;&emsp;处理数据，包括读写数据表、调用后端服务、读写缓存等。

&emsp;&emsp;services 目录中的 index.js 文件会初始化各个 service 文件，并将之前的 models 对象作为参数传入。

&emsp;&emsp;注意，MySQL中查询数据返回值中会包含各种信息，如果只要表的数据需要在查询条件中加 ”raw:true“（如下所示）或将返回值调用 toJSON()。
```javascript
  async getConfigContent(where) {
    return this.models.AppGlobalConfig.findOne({
      where,
      raw: true
    });
  }
```

#### 7）scripts
&emsp;&emsp;如果要跑脚本，首先修改 scripts/index.js 文件中的最后一行 require() 的参数，即修改 ”./demo“。
```javascript
global.env = process.env.NODE_ENV;
global.logger = {
  trace: console.log,
  info: console.log,
  debug: console.log,
  error: console.log,
  warn: console.log,
};
require('./demo');
```
&emsp;&emsp;当前位置如果与 scripts 目录平级，则执行命令：
```bash
$ NODE_ENV=development node scripts/index.js
```
&emsp;&emsp;其中 NODE_ENV 为环境常量，test、pre 和 production。

#### 8）static
&emsp;&emsp;上传的文件默认会保存在 static/upload 目录中，git 会忽略该文件，不会提交到仓库中。


# 开发步骤
1. 首先是在 models 目录中新建对应的表（如果不是新表，该步骤可省略）。
2. 然后是在 routes 目录中新建或修改某个路由文件。
3. 最后是在 services 目录中新建或修改某个服务文件。

&emsp;&emsp;在项目研发的过程中，发现很多操作都是对数据库做简单地增删改查，有时候就需要在上述三个目录中各自新建一个文件。

&emsp;&emsp;这么操作费时费力，到后期会发现有很多这样的接口，在维护上也会增加挑战，因此抽象了一套通用接口，保存在 routes/common.js 中。

* get：读取一条数据（单表查询）
* gets：读取多条数据（单表查询）
* head：读取聚合数据，例如count()、sum()、max() 和 min()
* post：提交数据，用于增加记录
* put：更新数据

&emsp;&emsp;所有的接口采用 post 的请求方式，数据库表都是单表查询，不支持联表，若要联表则单独创建接口。

# 定时任务
&emsp;&emsp;本地调试全任务可执行：
```bash
$ npm run worker
```
&emsp;&emsp;本地调试单任务可执行下面的命令，其中 ? 代表任务名称，即文件名，不用加后缀。
```bash
$ JOB_TYPES=? npm run worker
```
&emsp;&emsp;在 worker 目录中还包含两个目录：cronJobs 和 triggerJobs。

&emsp;&emsp;前者是定时类任务 （指定时间点执行），使用了 [node-schedule](https://github.com/node-schedule/node-schedule) 库。
```javascript
module.exports = async () => {
  //每 30 秒执行一次定时任务
  schedule.scheduleJob({ rule: "*/30 * * * * *" }, () => {
    test(result);
  });
};
```
&emsp;&emsp;后者是触发类任务，在代码中输入指令触发执行，使用 [agenda](https://github.com/agenda/agenda) 库。
```javascript
module.exports = (agenda) => {
  // 例如满足某种条件触发邮件通知
  agenda.define('send email report', (job, done) => {
    // 传递进来的数据
    const data = job.attrs.data;
    console.log(data);
    // 触发此任务，需要先引入 agenda.js，然后调用 now() 方法
    // import agenda from '../worker/agenda';
    // agenda.now('send email report', {
    //   username: realName,
    // });
  });
};
```
&emsp;&emsp;注意，写好的任务记得添加进入口文件 index-worker.js。
```javascript
require('./worker/cronJobs/demo')();
require('./worker/triggerJobs/demo')(agenda);
```

# 单元测试
&emsp;&emsp;运行下面的命令就会执行单元测试。
```bash
$ npm test
```
&emsp;&emsp;单元测试使用的框架是 [mocha 3.4](https://mochajs.cn/)，采用的断言是 [chai 4.0](https://www.chaijs.com/api/bdd/)，API测试库是 [supertest 3.0](https://github.com/visionmedia/supertest)，测试替代库 [sion.js](https://sinonjs.org)
```javascript
// routers 测试
describe('GET /user/list', () => {
  const url = '/user/list';
  it('获取用户列表成功', (done) => {
    api
    .get(url)
    .set('Authorization', authToken)
    .expect(200, done);
  });
});

// serveices 测试
import backendUserRole from '../../services/backendUserRole';
describe('用户角色', () => {
  it('获取指定id的角色信息', async () => {
    const service = new backendUserRole(models);
    const res = await service.getInfoById('584a4dc24c886205bd771afe');
    // expect(2).toBe(2);
    // expect(res.rolePermisson).to.be.an('array');
  });
});
```