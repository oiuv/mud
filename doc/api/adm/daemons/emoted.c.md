## 说明

    表情动作系统守护进程

## 继承

    inherit F_SAVE;
    inherit F_DBASE;

## 属性

    mapping emote;

## 方法

    int remove();
    string query_save_file();
    varargs mixed do_emote(object me, string verb, string arg, int channel_emote, string who, string default_color);
    int set_emote(string pattern, mapping def, int raw);
    int delete_emote(string pattern);
    string *query_emote_data(string pattern);
    mapping query_emote(string pattern);
    string *query_all_emote();
