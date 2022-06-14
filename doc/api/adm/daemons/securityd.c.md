## 说明

    系统安全及权限验证守护进程

## 继承

    inherit F_SAVE;

## 属性

    private nosave mapping wiz_status;
    private nosave string *wiz_levels;
    private nosave int seq;
    // ultra rules
    private nosave mapping trusted_read;
    private nosave mapping exclude_read;
    private nosave mapping trusted_write;
    private nosave mapping exclude_write;

    // extend rules save in diskette
    private mapping extend_trusted_read;
    private mapping extend_exclude_read;
    private mapping extend_trusted_write;
    private mapping extend_exclude_write;

    // grant information for command
    private mapping grant;

    // grant information for sites
    private mapping site_privilege;

## 方法

    int restore();
    int save();
    mapping query_security(string para);
    int set_security(string para, mapping ruler);
    mapping combine_rules(mapping def, mapping extend);
    void reset_security();
    string *query_wiz_levels();
    string *query_wizlist();
    string get_status(mixed ob);
    int get_wiz_level(mixed ob);
    int set_status(mixed ob, string status);
    string *get_wizlist();
    void remove(string euid);
    int valid_write(string file, mixed user, string func);
    int valid_read(string file, mixed user, string func);
    int valid_seteuid(object ob, string uid);
    int valid_bind(object binder, object old_owner, object new_owner);
    int valid_grant(object ob, string min_level);
    int grant(string user, string cmd);
    int remove_grant(string user, string cmd);
    string *query_grant(string user);
    string *query_grant_users();
    varargs int set_site_privilege(string item, string desc);
    varargs mixed query_site_privilege(string item);
    void backup_file(string file);
