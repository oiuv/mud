## 说明

    聊天频道守护进程

## 继承

    inherit F_DBASE;

## 属性

    nosave string msg_log;
    nosave int log_from;
    mapping channels;

## 方法

    void channel_log(string msg, string verb, object user);
    void do_remote_channel(object me, string verb, string arg);
    varargs int do_channel(object me, string verb, string arg, int emote);
    int filter_listener(object ppl, string only, object me);
    string remove_addresses(string msg, int all);
