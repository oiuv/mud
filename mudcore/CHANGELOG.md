<!--
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-29 15:56:47
 * @LastEditTime: 2022-05-15 14:40:48
 * @LastEditors: 雪风
 * @Description:
 *  https://bbs.mud.ren
-->
## 更新日志

### 2022年5月

* 增加Http客户端，优化相关示例项目
* 增加MSP接口

### 2022年3月

* 取消默认GBK编码支持
* 自定义出生点优化
* 增加谓词语法分析支持模块
* 增加部分辅助函数

### 2021年12月

* 环境增加area模式支持（移植自台湾火影MUD）
* 增加任务接口和守护进程
* 增加部分标准示例

### 2021年11月

* 调整CORE_DBSAVE函数is_ob_saved()为is_db_saved()
* 更新ansi.h，支持更多颜色和光标控制，增加示例指令colors

### 2021年9月

* 增加手机短信验证码示例接口
* 调整CONFIG_D为ENV_D，环境变量配置文件修改为`/data/.env`
* 调整sefun，itoc(int)改名为unicode(int)

### 2021年7月

* 增加CORE_INTERMUD_D，方便使用游戏列表互联，示例指令mudlists

### 2021年6月

* 优化CORE_ROOM，增加光线相关方法接口
* 增加HTTP功能示例模块（智能机器人和QQ聊天机器人）

### 2021年5月

* 增加部分sefun和默认指令
* 增加CORE_DB接口，方便数据库操作

### 2021年4月

* 增加CORE_CONFIG_D，方便游戏自定义运行配置，配置文件位置`/data/config`
* 为了数据安全调整数据库密码配置也保存在自定义配置文件中

### 2021年3月

* 调整CORE_LOGIN_D中 init_new_player 方法为`private void init_new_player(object user, object ob)`
* 新增CORE_NAME_D，用户注册校验是否重名

### 2021年1月

* MOVE 模块优化，增加可控制是否自动 look
* DBASE 模块增加默认对象设置
* ROOM 模块优化，增加函数别名
* 增加完善部分守护进程
* 更新指令系统，增加指令缓存和文件形式的别名功能(在指令目录新建 `别名.alias` 文件，内容为别名对应指令然后 rehash 即可生效)
* 更新系统自带指令使用说明，补充框架文档

### 2020年

* 发布MUDCORE测试版
