## 说明

    师门任务和系统注册任务守护进程。

## 继承

    inherit F_DBASE;

## 属性

    无

## 方法

    private void special_bonus(object me, object who, mixed arg);
    public mixed accept_ask(object me, object who, string topic);
    int ask_quest(object me, object who);
    int accept_object(object me, object who, object ob);
    int cancel_quest(object me, object who);
    public void add_quest(object qob);
    public void set_information(object qob, string key, mixed info);
    public mixed query_information(object qob, string key);
    public void remove_information(object qob, string key);
    public void remove_all_information(object qob);
    public void remove_quest(string name);
    private void collect_all_quest_information();
    public void start_all_quest();
    public string generate_information(object knower, object who, string topic);
