开发规范
============
规范：PSR
------------
PHP Standard Rule

    PSR-0 规范
    PSR-1 基本代码规范
    PSR-2 代码风格规范
    PSR-3 日志接口规范
    PSR-4 自动加载

访问超全局数组是不能直接访问
-------------
+ `$_SESSION[name]`   =   `Yii::$app->session->get(key)/set()`
+ `$_POST`  = `Yii::$app->request->post()`
+ `$_GET` = `Yii::$app->request->get()`
+ `$_COOKIE` = `Yii::$app->request->cookies->get()/ Yii::$app->response->cookie->add()`
+ `GET/POST`请求在`functions.php`中有简化封装,分别全局调用`get/restful`
   其中`restful`用于接收除了`GET`外所有请求数据

IDE 友好
--------------
为了`Yii::$app->component` 可以被 **IDE** 识别

可以将自定义components加入到`\common\components\ApplicationReference` 类的注释中.

E.g.  `@property \namespace\to\class $component`

@See ./application_reference.jpg

环境配置（本地配置）
-------------
运行根目录init.bat 或者init，会把`environments`下`*-local.php`的配置文件拷贝到对应项目

**开发环境**：

    init --env=Development --overwrite=yes
**生产环境**:

    init --env=Production --overwrite=yes
数据库迁移 & 国际化
----------
Yii 提供了强大的命令行工具,常用的命令有 `migrate` & `message`

+ `migrate`

   执行SQL命令,修改数据库结构,插入默认数据.
   流程通常是创建migration文件(`create`), 修改文件, 执行文件(`up`).

   `migration` 基类为 `\common\components\Migration`, 类中封装方法：
    + createTableWithBaseFields       创建一张带有 baseFields 的表`
    + createTablesWithBaseFields      创建多张带有 baseFields 的表
    + dropTables                      删除多张表
    + constrainExists                 是否存在约束

+ `message`
   提取国际化(`Yii::t()`)数据, 程序中,凡是需要输出的字符串,应该调用国际化函数

   `Yii::t(string $category, string $message, array $params)`

   执行`message`时,将提取出所有调用该函数的文本,位于`common/messages/`

   国际化第一个参数多个单词使用中划线隔开，`e.g. Yii::t(userlog, xxx) => Yii::t(user-log, xxx)`

<font color="red">
**注意**
</font>

+ `Yii::t()` 的前两个参数不能使用动态字符串,或者函数拼接,
国际化翻译文件不能出现动态字符串, e.g.,

        <?php

        return [
            'This is test' => '这是一个测试', // Ok
            'This is test' => $_GET['test_i18n'], // Invalid expression
            'This is test' => Yii::t('cate', 'Another test'), // Invalid expression
        ];

+ 执行方法 : `terminal`中运行

        # 执行 (默认)
        yii migrate
        yii migrate/up
        # 创建
        yii migrate/create migration_name
        # 回滚
        yii migrate/down
        # 提取数据
        yii message messageConfigFile

Migration & Submodule
---------------------
为了确保不同开发人员添加的数据库DDL语句不会冲突，我们需要经常运行 `yii migrate`，
**尤其在`create` 新的 `migration` 前**，
由于每个人的分支不一样，我们就需要保持数据库始终处于master分支，故单独提出为`submodule`

具体操作：

    #1 第一次拉取submodule
    git submodule update --init
    ##### 执行第二步(#2) ####

    #2 拉取(获取最新)
    cd <submodule path>
    git checkout master
    git pull

    #3 提交
    cd <submodule path>
    git checkout master
    git add/commit/push
所有submodule更新提交到`master`分支

后端页面接口命名
----------
为了是页面接口与页面权限统一, 需要注意接口的命名

页面  user/info

页面内接口   user/info-api (actionInfoApi)

Model & 常量命名规范
------------
Model 位于 `common/models/` 以确保所有模块可以访问到.

Form 相关类为与对应模块下 `{module}/models/XxxForm`, e.g. `api/models/LoginForm`

所有数据库相关常量定义在ActiveRecord中, e.g.

    // 表 user 有字段 status
    use yii\db\ActiveRecord;

    class User extends ActiveRecord
    {
        /* for field status */
        const STATUS_LOCKED = -1;
        const STATUS_ACTIVE = 1;
    }

gii
--------
gii 为官方代码生成器，在backend下执行

    e.g.
    http://ali.net/backend?r=gii

常用方法
-------------
+ 软删除

    数据库数据删除统一采用软删除， `\common\components\ActiveRecord::deleteSoftly`
+ 配置缓存
    
    后端所有配置(e.g. 动态图文限制), 都需要写到缓存(redis), 以减少数据库访问, 这里将 '读写' 操作都做了封装
    
    参见 `common\helpers\Config`
    + 添加缓存 `Config::set` `Config::setEncode`
    + 读取缓存 `Config::get` `Config::getDecode`