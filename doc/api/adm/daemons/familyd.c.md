## 说明

    门派守护进程，主要控制门派声望和仇杀数据。

## 继承

    inherit F_SAVE;
    inherit F_DBASE;

## 属性

    mapping family_fame;
    nosave mapping base_family_fame;
    nosave mapping family_name;
    mapping last_family_fame;

## 方法

    void remove();
    public void mud_shutdown();
    public string query_save_file();
    public mixed query_family_fame(mixed ob);
    public mapping query_all_last_family_fame();
    public mapping query_family_hatred(mixed ob);
    public void add_family_fame(mixed ob, int n);
    public void family_kill(object killer, object victim);
    public void remove_hatred(string id);
    private int sort_hatred(string id1, string id2, mapping hatred);
    public string query_family_name(string fid);
