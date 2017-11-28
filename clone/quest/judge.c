// 玩家任务：judge.c

#include <ansi.h>
#include <quest.h>

inherit QUEST_OB;

#define QOB             my["qob"]
#define NPC1            my["npc1"]
#define NPC2            my["npc2"]
#define NPC1_NAME       my["npc1_name"]
#define NPC2_NAME       my["npc2_name"]
#define NPC1_ID         my["npc1_id"]
#define NPC2_ID         my["npc2_id"]
#define PLACE           my["place"]

string ask_1_for_2();
string ask_2_for_1();

// 任务对象创建
void create()
{
        setup();
}

// 启动一个任务
// 输入一个物品进行寻找，自动生成两个人物和两个地点，其中杀
// 了第一个人即可获得该物品，然后交给第二个人领取奖励。
void init_quest()
{
        string name;
        string place;
        object npc1, npc2;
        mapping my;

        // 产生两个随机地点
        place = NPC_D->random_place(({ "西域" }));

        // 产生两个随机人物
        npc1 = new(CLASS_D("generate") + "/questnpc");
        npc2 = new(CLASS_D("generate") + "/questnpc");

        npc1->set_temp("quest_ob", this_object());
        npc2->set_temp("quest_ob", this_object());

        // 生成任务的名字
        name = npc1->name(1) + "和" + npc2->name(1) + "的事";
        set_name(name);

        // 记录这些人物、地点和物品信息
        my = query_entire_dbase();

        NPC1 = npc1;
        NPC2 = npc2;
        PLACE = place;
        NPC1_NAME = npc1->name();
        NPC2_NAME = npc2->name();
        NPC1_ID = npc1->query("id");
        NPC2_ID = npc2->query("id");

        // 人物出现
        NPC_D->place_npc(npc1, 0, ({ place }));
        npc2->move(environment(npc1));
        npc1->delete("chat_chance");
        npc1->delete("chat_msg");
        npc2->delete("chat_chance");
        npc2->delete("chat_msg");

        // 设置对话信息
        npc1->set("inquiry", ([
                NPC1_NAME : "那就是鄙人我了！",
                NPC1_ID   : "那就是鄙人我了！",
                NPC2_NAME : (: ask_1_for_2 :),
                NPC2_ID   : (: ask_1_for_2 :) ]));

        npc2->set("inquiry", ([
                NPC1_NAME : (: ask_2_for_1 :),
                NPC1_ID   : (: ask_2_for_1 :),
                NPC2_NAME : "正是区区，有何贵干？",
                NPC2_ID   : "正是区区，有何贵干？" ]));

        // 切换到正常状态
        change_status(QUEST_READY);

        // 设置任务最长存活时间：15分钟
        set("live_time", 900);

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

        if (objectp(NPC1))
                destruct(NPC1);

        if (objectp(NPC2))
                destruct(NPC2);

        // 任务消亡
        ::cancel_quest();
}

// 询问NPC1有关NPC2的事情
string ask_1_for_2()
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC2))
                return "天啊，他...他怎么这就...我也没想这样啊！";

        if (! environment(NPC2))
                return NPC2->name() + "这" + RANK_D->query_rude(NPC) +
                       "不知道溜到哪里去了。";

        switch (random(3))
        {
        case 0:
                return "这混蛋，简直就是不可理喻。";
        case 1:
                return "碰到他，我算是到了十八辈子的霉，不，十九辈子！";
        default:
                return "我和他没法讲理，因为他就没理！";
        }
}

// 询问NPC2有关NPC1的事情
string ask_2_for_1()
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return "我...我可没有想害他...真的没有啊！";

        if (! environment(NPC1))
                return "他奶奶的，" + NPC2->name() + "这个" +
                       RANK_D->query_rude(NPC) + "！跑了？";

        switch (random(3))
        {
        case 0:
                return "不要提他，听到这个名字我就生气！";
        case 1:
                return "你别添乱，这人让我堵心。";
        default:
                return "他以为自己声音大就占理了？他是老天啊，靠打雷讲理？";
        }
}

// 询问NPC1的状况
string ask_npc1(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return CYN "嘿，据说" HIY + NPC1_NAME + NOR CYN
                       "被人做掉了，你看看，火气大就没好处吧！" NOR;

        return CYN "哦，这人呀，我也不认识他，没听过他的字号。" NOR;
}

// 询问NPC2的状况
string ask_npc2(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC2))
                return CYN "嘿，据说" HIY + NPC2_NAME + NOR CYN
                       "被人砍了，脾气大敢情就这下场呀。" NOR;

        return CYN "这人我没怎么听说过，唉！孤陋寡闻啊。" NOR;
}

// 询问单正
string ask_shan(object knower, object me)
{
        if (me->query("weiwang") < 1000)
                call_out("do_whisper", 1, knower, me);

        return CYN "连铁面判官你都不认识？啧啧，他老人家可是武林"
                   "中的\n名人呀，家住泰山，专门调节各种纠纷，处"
                   "理不平之事。\n" NOR;
}

// 通知玩家
void do_whisper(object knower, object me)
{
        if (! can_talk_with(knower, me))
                return;

        tell_object(me, WHT + knower->name() + WHT "悄悄的和你"
                    "说：“可惜你的江湖威望太低了，请不动他。”\n");
        message("vision", knower->name() + "在" + me->name() +
                "的耳边悄悄的说了些什么。\n", environment(me), ({ me }));
}

// 任务介绍
string query_introduce(object knower)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC2))
        {
                remove_call_out("do_say");
                call_out("do_say", 1, knower);
        }

        return CYN "听说" HIY + NPC1_NAME + NOR CYN "和" +
               HIY + NPC2_NAME + NOR CYN "在" + PLACE +
               CYN "发生了纠纷，不知道为什么，要是"
               HIY "单正" NOR CYN "在就好了。" NOR;
}

// 这个消息能够被散布吗？
int can_rumor_by(object knower)
{
        // 20%的几率被散布
        return (random(10) < 2);
}

// 登记该任务的消息
void register_information()
{
        mapping my = query_entire_dbase();

        if (! clonep() || ! mapp(my))
                // 不是任务，所以不登记
                return;

        set_information(NPC1_NAME, (: ask_npc1 :));
        set_information(NPC2_NAME, (: ask_npc2 :));
        set_information(NPC1_ID, (: ask_npc1 :));
        set_information(NPC2_ID, (: ask_npc2 :));
        set_information("单正", (: ask_shan :));
        set_information("shan zheng", (: ask_shan :));
}