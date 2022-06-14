## 说明

    系统守护进程说明文档，包括此进程对象继承的对象、全局属性和实现的方法。

## 继承

    inherit F_DBASE;
    inherit F_SAVE;

## 属性

    无

## 方法

    string query_save_file();
    void remove();
    varargs mixed query(string idx, int raw);
    mixed set(string idx, mixed data);
    void examine_player(object ob);
    string create_log_file(object ob);
    int start_log_player(string id, string me);
    int end_log_player(string id, string euid);
