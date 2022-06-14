### CORE_ROOM

房间环境对象继承，本接口需要继承`DBASE`和`NAME`接口才能正常使用，并推荐继承 `CLEAN_UP`接口。

实现的核心方法如下：

```c
// 初始化环境，加载环境中的对象
void setup();

// 获取环境坐标
string coordinate();

// 设置环境区域和坐标
varargs void setArea(int area, int x, int y, int z);

// 移除指定出口
void removeExit(string dir);

// 移除随机出口
void removeRandomExit();

// 增加出口
void addExit(string dir, string dest);

// 检查是否合法移动
int valid_leave(object me, string dir);

// 设置门
varargs void set_door(string dir, mixed data, string other_side_dir, int status);

// 打开门
varargs int open_door(string dir, int from_other_side);

// 关闭门
varargs int close_door(string dir, int from_other_side);

// 获取指定的门
mixed query_door(string dir, string prop);

// 获取所有的门
mapping query_doors();

// 查看门
string look_door(string dir);
```
