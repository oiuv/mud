### CORE_DBASE_D

`DBASE_D` 公共数据库系统守护进程，主要用来存储游戏公共数据，存档文件为 `/data/dbase_d.o`。

### 核心方法

```c
// 某个对象读取自己的记录
mixed query_data();
// 某个对象保存自己的记录
int set_data(mixed data);
// 读取某个对象的记录
mixed query_object_data(object ob);
// 保存某个对象的记录
int set_object_data(object ob, mixed data);
// 读取所有对象的记录
mapping query_save_dbase();
// 查阅保存了数据的所有对象
string *query_saved_object();
// 清除一个对象
int clear_object(mixed ob);
// 清理所有对象
int cleanup_all_save_object(int raw);
varargs int remove(string euid);
void mud_shutdown();
```

使用 `DBASE_D` 功能的对象需要继承 `CORE_DBSAVE` 接口并是实现`save_dbase_data` 和 `receive_dbase_data()` 方法实现数据存档和读档。
