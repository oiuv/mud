## 说明

    玩家闭关守护进程

## 继承

    inherit F_SAVE;

## 属性

    apping closed_users = 0;

## 方法

    void remove();
    void mud_shutdown();
    string query_save_file();
    mapping query_closed_users();
    void user_closed(object user);
    void user_opened(object user);
    void continue_doing(object user_ob);
    void load_all_users();
