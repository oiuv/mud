## 说明

    名称管理系统守护进程

## 继承

    inherit F_SAVE;
    inherit F_DBASE;

## 属性

    nosave string *family_name;

## 方法

    void remove();
    void mud_shutdown();
    public void remove_name(string name, string id);
    public void map_name(string name, string id);
    public string who_is(string name);
    private int really_exist(string name, string id);
    public void assure_map_name(string name);
    public string invalid_new_name(string name);
    public varargs string change_name(object me, string new_name, int force);
    public int query_total_name();
    string query_save_file();
