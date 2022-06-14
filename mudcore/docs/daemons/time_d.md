### CORE_TIME_D

`TIME_D` 游戏时间守护进程，设置游戏系统的时间和计划任务。

### 核心方法

```c
void set_game_crontab(mixed *crontab);
void set_real_crontab(mixed *crontab);
int query_gametime();
int query_realtime();
int *query_game_time();
int *query_real_time();
void add_event(function fevent, int delay_time);
void exec_event(function fevent);
string replace_ctime(int t);
string season_period(int m);
string week_period(int w);
string hour_period(int h);
string gametime_digital_clock();
string realtime_digital_clock();
string time_description(string title, int *t);
string game_time_description(string arg);
string real_time_description(string arg);
int *analyse_time(int ;
void process_crontab(mixed *crontab, int *timearray);
int reset_gametime(int time);
```

#### 游戏时间系统说明

    现实２秒 = 游戏１分钟
    现实２分钟 = 游戏１小时
    现实４８分钟 = 游戏１天
    现实１天 = 游戏３０天

#### 计划任务说明

游戏中可以自己定义一个计划任务守护进程，实现计划任务，示例代码如下：

```c
/* 计划任务格式说明 */
// 分(0-59) 时(0-23) 日(1-31) 月(0-11) 周(0-6) 年 任务(function) "备注"
// 星号（*）：代表所有可能的值
// 逗号（,）：可以用逗号隔开的值指定一个列表范围，例如，“1,2,5,7,8,9”
// 中杠（-）：可以用整数之间的中杠表示一个整数范围，例如“2-6”表示“2,3,4,5,6”
// 正斜线（/）：可以用正斜线指定时间的间隔频率，例如“21-5/2”或“*/10”
void create()
{
    mixed *game_crontab = ({
        "5,25,50 * * * * *", (: debug("game_crontab! " + TIME_D->gametime_digital_clock()) :), "测试",
    });
    mixed *real_crontab = ({
        "* * * * * *", (: debug("real_crontab! " + ctime()) :), "测试任务",
        "*/2 * * * * *", ( : TIME_D->save() :), "存储游戏世界时间",
    });
    TIME_D->set_game_crontab(game_crontab);
    TIME_D->set_real_crontab(real_crontab);
}
```
