## 说明

    玩家资料更新设置守护进程

## 继承

    inherit F_SAVE;

## 属性

    mixed title_base;

## 方法

    void check_user(object ob);
    string clear_user_data(string user, string cat);
    string remove_user(string user);
    void born_player(object me);
    void zhuan_player(object me);
    void notice_player(object me, string msg);
    mixed query_title_base();
    mixed set_title_base(mixed ts);
    void remove_title(object ob);
    void set_title(object ob);
    object global_find_player(string user);
    void global_destruct_player(object ob, int raw);
