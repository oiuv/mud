## 说明

    DBASE系统数据库守护进程

## 继承

    inherit F_DBASE;
    inherit F_SAVE;

## 属性

    mapping save_dbase;
    nosave  int save_flag = ONLY_SAVE;

## 方法

    int cleanup_all_save_object(int raw);
    string query_save_file();
    mixed query_data();
    int set_data(mixed data);
    mixed query_object_data(mixed ob);
    int set_object_data(mixed ob, mixed data);
    mapping query_save_dbase();
    string *query_saved_object();
    int clear_object(mixed ob);
    int remove(string euid);
    void mud_shutdown();
    protected int announce_all_save_object(int destruct_flag);
