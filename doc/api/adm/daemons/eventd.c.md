## 说明

    系统事件守护进程。

## 继承

    inherit F_DBASE;

## 属性

    nosave string *event_name;      // 系统中所有的事件
    nosave mapping event_list;      // 待触发的事件

## 方法

    string *query_all_event();
    mapping query_event_list();
    void collect_all_event();
    // int test(string st, int year, int month, int day, int hour, mixed para);
    int at_when(int year, int month, int day, int hour, mixed para);
    int at_after(int year, int month, int day, int hour, mixed para);
