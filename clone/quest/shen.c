// 玩家任务：shen.c

#include <ansi.h>
#include <quest.h>

inherit QUEST_OB;

#define QOB             my["qob"]
#define NPC_OB          my["npc_ob"]
#define NPC_ID          my["npc_id"]
#define NPC_NAME        my["npc_name"]
#define PLACE           my["place"]
#define TYPE            my["type"]
#define ZONE            my["zone"]

void npc_destructed();

// 任务对象创建
void create()
{
        setup();
}

// 启动一个任务
// 杀一个人即可获得神的奖励。
void init_quest()
{
        string name;
//      object qob;
        string place;
        object npc;
        mapping my;
        int type;

        // 产生两个随机地点
        place = NPC_D->random_place(({ "西域" }));

        // 产生两个随机人物
        npc = new(CLASS_D("generate") + "/shennpc");
        npc->set_temp("quest_ob", this_object());

        // 设置析构信息：NPC人物析构以后将自动解除任务
        npc->set_temp("override/destruct", (: npc_destructed :));

        // 生成任务的名字
        if (type = random(2))
        {
                name = "飞贼" + npc->name();
                npc->set("shen_type", -1);
        } else
        {
                name = "反贼" + npc->name();
                npc->set("shen_type", 1);
        }
        set_name(name);

        // 记录这些人物、地点和物品信息
        my = query_entire_dbase();

        TYPE = type;
        NPC_OB = npc;
        PLACE = place;
        NPC_NAME = npc->name();
        NPC_ID   = npc->query("id");

        // 人物出现
        NPC_D->place_npc(npc, 0, ({ place }));

        if (sscanf(file_name(environment(npc)), "/d/%s/%*s", ZONE) == 2)
            ZONE = "/d/" + ZONE + "/";
        else
            ZONE = "/";

        // 切换到正常状态
        change_status(QUEST_READY);

        // 设置任务最长存活时间：30分钟
        set("live_time", 1800);

        // 登记谣言消息
        register_information();
}

// 任务终止
void cancel_quest()
{
        mapping my = query_entire_dbase();
//      object env;

        if (! mapp(my))
                return;

        if (objectp(NPC_OB))
        {
                NPC_OB->delete_temp("override/destruct");
                destruct(NPC_OB);
        }

        // 任务消亡
        ::cancel_quest();
}

// 任务NPC消亡
void npc_destructed()
{
        call_out("cancel_quest", 0);
}

// 询问NPC
string ask_npc(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC_OB))
                return CYN "哎，这年头，出头就没有好事，小命都要送掉了。" NOR;

        return CYN "哎，都说他在" + PLACE + "，找他的人好像可多了。" NOR;
}

// 任务介绍
string query_introduce(object knower)
{
        mapping my = query_entire_dbase();

        switch (TYPE)
        {
        case 0:
                return "听说朝廷正在通缉反贼" + NPC_NAME +
                       "，啧啧，胆子大了，敢造反。";
        case 1:
                return "据说官府正在捉拿飞贼" + NPC_NAME +
                       "，这家伙，可不是好人啊。";
        }
}

void do_say(object knower)
{
        mapping my = query_entire_dbase();

        message_vision("$N又自言自语道：凡是被官府捉拿的都没好下场，你看，" +
                       NPC_NAME + "这么狠，不也把小命送掉了？\n", knower);
}

// 这个消息能够被散布吗？
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

// 登记该任务的消息
void register_information()
{
        mapping my = query_entire_dbase();

        if (! clonep() || ! mapp(my))
                // 不是任务，所以不登记
                return;

        set_information(NPC_NAME, (: ask_npc :));
        set_information(NPC_ID, (: ask_npc :));
}