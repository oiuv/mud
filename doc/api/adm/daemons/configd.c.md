## 说明

    系统守护进程说明文档，包括此进程对象继承的对象、全局属性和实现的方法。

## 继承

    inherit F_DBASE;

## 属性

    无

## 方法

    void load_config();
    int query_int(string index);
    string query_string(string index);
    string query_remember(string index);
    string query_affix(string index);
    string query_config_file_name();
