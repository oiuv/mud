## 说明

    故事系统守护进程

## 继承

    无

## 属性

    nosave string *story_name;
    nosave object running_story;
    nosave mapping history;
    nosave int step;

## 方法

    private void init_story();
    private void ready_to_start();
    private void go_on_process(object ob);
    object query_running_story();
    varargs void start_story(string sname);
    void remove_story(string story);
    string *query_all_story();
    void process_story(object ob);
    int filter_listener(object ob);
    void give_gift(string gift, int amount, string msg);
