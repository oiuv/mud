// 玩家任务守护进程：search.c

#include <ansi.h>

string *lost_objs = ({
        "/clone/questob/baijinhe",
        "/clone/questob/baiyubi",
        "/clone/questob/jingua",
        "/clone/questob/jinhulu",
        "/clone/questob/jlhua",
        "/clone/questob/jxshi",
        "/clone/questob/qkmao",
        "/clone/questob/qtding",
        "/clone/questob/sjping",
        "/clone/questob/tiegy",
        "/clone/questob/tieruyi",
        "/clone/questob/tongxq",
        "/clone/questob/ygbei",
        "/clone/questob/ylhua",
        "/clone/questob/yudai",
        "/clone/questob/yuhulu",
        "/clone/questob/yuping",
        "/clone/questob/zijinchui",
        "/clone/questob/zysha",
});

void startup();

// 任务对象创建
void create()
{
        seteuid(getuid());
        if (! clonep() && find_object(QUEST_D)) startup();
}

void start_quest()
{
        object qob;
        string qob_name;
        string *ob_names;

        // 派生其它的任务对象：必须有可用物品，当前任务 < 5
        ob_names = filter_array(lost_objs, (: ! find_object($1) || ! $1->query_temp("quest_ob") :));
        if (sizeof(ob_names) < 1)
                return;

        if (sizeof(children("/clone/quest/search")) > 15)
                // 系统中最多10个寻找物品的任务
                return;

        qob_name = ob_names[random(sizeof(ob_names))];
        qob = new("/clone/quest/search");
        qob->init_quest(qob_name);
        CHANNEL_D->do_channel(find_object(QUEST_D),
                              "sys", "进程(SEARCH)"
                              HIR "利用" + qob_name->name() +
                              HIR "创建了一个任务。");
}

private void heart_beat()
{
        if (! find_object(QUEST_D))
                return;

        // 如果可以，每次心跳产生一个QUEST
        start_quest();
}

// 任务守护进程唤醒这个进程
void startup()
{
        // 启动
        if (! find_object(QUEST_D))
                return;

        if (! query_heart_beat())
                CHANNEL_D->do_channel(find_object(QUEST_D),
                                      "sys", "进程(SEARCH)启动了。");

        // 平均每四分钟产生一个任务
        set_heart_beat(110 + random(20));
}

// 停止这个任务进程
void stop()
{
        set_heart_beat(0);
}
