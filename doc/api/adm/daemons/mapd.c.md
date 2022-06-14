## 说明

    地图交通系统守护进程

## 继承

    无

## 属性

    mapping map_short;
    mapping map_to;
    mapping map_trans;
    mixed connect_info;

## 方法

    public int been_known(string outdoors);
    public string query_map_short(string outdoors);
    public string *query_all_map_zone();
    public string query_maps(string outdoors);
    string get_map_line(string line, int x, int n);
    public string mark_map(string map, string name);
    public string marked_map(object env);
    public int record_rumor(mixed obs, string topic, mixed event_ob);
    public varargs mixed query_trans_info(string to);
    public mapping query_connect_info();
