// 玩家提示任务：avoid.c

#include <ansi.h>
#include <quest.h>
#include <command.h>

inherit QUEST_OB;

#define ZONE            my["zone"]      // 接收对象所处的区域

// 任务对象创建
void create()
{
        seteuid(getuid());
        setup();
}

// 这是提示信息任务：凡是启动了这个任务，那么玩家询问的话就
// 有可能打听到相应的消息。
//
// 其中输入参数env 则是任务相关的场景，如果定义了这个参数，
// 那么上只有和这个场景在同一个区域的消息灵通人士才能够得知
// 这个任务所支持的消息。
//
// 在调用这个初始化的函数之前，调用者必须先处理好所有需要散
// 布的消息，这通过设置/rumor这个映射对象来实现。比如需要散
// 布“位置”这个消息，就需要设置“/rumor/位置”为位置消息。
void init_quest(string quest_name, object env)
{
        mapping my;
        string zone;

        my = query_entire_dbase();

        // 生成任务的名字
        set_name(quest_name);

        // 检索场景
        if (objectp(env))
        {
                zone = base_name(env);
                if (sscanf(zone, "/d/%s/%*s", zone) == 2)
                        zone = "/d/" + zone + "/";
                else
                        zone = "/";
        } else
                zone = "/";
        ZONE = zone;

        // 切换到正常状态
        change_status(QUEST_READY);

        // 设置任务最长存活时间：60分钟
        set("live_time", 1800);

        // 登记谣言消息
        register_information();
}

// 任务介绍
string query_introduce(object knower)
{
        return query("introduce");
}

// 登记该任务的消息
void register_information()
{
        mapping my = query_entire_dbase();
        mapping rumor;
        string  key;

        if (! clonep() || ! mapp(my))
                // 不是任务，所以不登记
                return;

        if (! mapp(rumor = query("rumor")))
                // 没有可以散布的消息
                return;

        // 登记所有可以散布的消息
        foreach (key in keys(rumor))
        {
                if (! stringp(key))
                        continue;

                set_information(key, rumor[key]);
        }
}

// 这个任务可以被某人散布吗？
int can_know_by(object knower)
{
        mapping my = query_entire_dbase();
        string fname;

        fname = file_name(environment(knower));
        if (! stringp(ZONE) || strlen(ZONE) < 1 ||
            ZONE == fname[0..strlen(ZONE) - 1])
                // 和小二在同一个区域
                return 1;

        return 0;
}

// 不能被散布
int can_rumor_by()
{
        return 0;
}
