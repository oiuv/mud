// 玩家任务：trace.c

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
#define PLACE1          my["place1"]
#define PLACE2          my["place2"]

string ask_1_for_2();
mixed ask_2_for_1(object npc2, object npc1, string npc1_name);

// 任务对象创建
void create()
{
        setup();
}

// 启动一个任务。自动生成两个人物，其中第二人打算寻
// 找第一人，只需把第二人带到第一人处即可以领取奖励。
void init_quest()
{
        string name;
        string place1, place2;
        object npc1, npc2;
        mapping my;

        // 产生两个随机地点
        place1 = NPC_D->random_place(({ "西域", place1 }));
        place2 = NPC_D->random_place(({ "西域", place2 }));

        // 产生两个随机人物
        npc1 = new(CLASS_D("generate") + "/questnpc");
        npc2 = new(CLASS_D("generate") + "/tracenpc");

        npc1->set_temp("quest_ob", this_object());
        npc2->set_temp("quest_ob", this_object());

        // 生成任务的名字
        name = "寻找" + npc1->name(1);
        set_name(name);

        // 记录这些人物、地点和物品信息
        my = query_entire_dbase();

        NPC1 = npc1;
        NPC2 = npc2;
        PLACE1 = place1;
        PLACE2 = place2;
        NPC1_NAME = npc1->name();
        NPC2_NAME = npc2->name();
        NPC1_ID = npc1->query("id");
        NPC2_ID = npc2->query("id");

        // 人物出现
        NPC_D->place_npc(npc1, 0, ({ place1 }));
        NPC_D->place_npc(npc2, 0, ({ place2 }));

        // 设置对话信息
        npc1->set("inquiry", ([
                NPC1_NAME : "那就是鄙人我了！",
                NPC1_ID   : "那就是鄙人我了！",
                NPC2_NAME : (: ask_1_for_2 :),
                NPC2_ID   : (: ask_1_for_2 :), ]));

        npc2->set("inquiry", ([
                name      : (: ask_2_for_1, npc2, npc1, npc1->name() :),
                NPC1_NAME : (: ask_2_for_1, npc2, npc1, npc1->name() :),
                NPC1_NAME : (: ask_2_for_1, npc2, npc1, npc1->name() :),
                NPC2_NAME : "那就是鄙人我了！",
                NPC2_ID   : "那就是鄙人我了！", ]));

        // 设置对象
        npc2->set_temp("trace", NPC1_ID);

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
                return "天啊，我兄弟他…他怎么了？";

        switch (random(3))
        {
        case 0:
                return "那天我们遇到仇人追杀，不小心就和他失散了，唉。";
        case 1:
                return "他是我同生共死的兄弟，可现在却不知他生在何处。";
        default:
                return "知道他在哪里么？快请他过来，跟他说兄弟这里危险。";
        }
}

// 询问NPC2有关NPC1的事情
mixed ask_2_for_1(object npc2, object npc1, string npc1_name)
{
        object me, follow;
//      string msg;

        me = this_player();

        if (me->query("score") < 500)
                return "谢谢你的好意，不过估计这事你也帮不上忙。";

        if (! me->query("quest/freequest"))
                return "唉，你也一样有要事在身，我怎么好麻烦你？";

        if (! me->query_temp("trace/" + npc2->query_temp("trace")))
                return "你…你是从哪里听来的？这不干你的事。";

        follow = npc2->query_leader();

        if (objectp(follow) && environment(follow) == environment(npc2))
        {
                // 正在跟随另外一个人，察看当前执行的任务。

                if (follow == me)
                        // 跟随的就是发话的人
                        return "咱们快别耽搁了，万一我兄弟有个三长"
                               "两短可…唉。";
                else
                        return "现在" + follow->name() + "正在帮着"
                               "寻找我兄弟，就不麻烦你了。";
        }
        message_vision(CYN "$N" CYN "一惊，紧握住$n" CYN "的双手道"
                       "：你…你知道我兄弟在哪里？快…快带我去。\n"
                       NOR, npc2, me);

        npc2->set_leader(me);
        message_vision("$N决定开始跟随$n一起行动。\n", npc2, me);

        // 四分钟以后解除跟随状态
        remove_call_out("cancel_follow");
        call_out("cancel_follow", 240, npc2, me);
        return 1;
}

// 停止跟踪
void cancel_follow(object npc2, object me)
{
        string startroom;

        if (! objectp(npc2))
                return;

        if (! stringp(startroom = npc2->query("startroom")))
                return;

        // 不再跟随
        npc2->set_leader(0);
        message_vision(CYN "$N" CYN "皱眉道：你到底知不知道我"
                       "兄弟的下落？算了，我还是自己找吧。\n"
                       NOR, npc2);

        message_vision(HIC "$N" HIC "叹了口气，头也不回的走了。"
                       "\n" NOR, npc2);

        // 返回故地
        npc2->move(startroom);
        message_vision("$N赶了过来。\n", npc2);
}


// 询问NPC1的状况
string ask_npc1(object knower, object me)
{
        mapping my = query_entire_dbase();

        if ((me->query("score") < 500
           || ! me->query("quest/freequest"))
           && ! me->query_temp("trace/have_ask"))
        {
                me->set_temp("trace/have_ask", 1);
                call_out("do_whisper", 1, knower, me);
        }

        if (! objectp(NPC1) && ! objectp(NPC2))
        {
                call_out("cancel_quest", 1);
                return CYN "嘿嘿，据说" HIY + NPC1_NAME + NOR +
                       CYN "和" HIY + NPC2_NAME + NOR + CYN "哥"
                       "俩终于见面了。啧啧，真不错。" NOR;
        }

        if (! objectp(NPC1))
                return CYN "唉…据说" HIY + NPC1_NAME + NOR +
                       CYN "还是被仇家给做掉了，到死也没见着"
                       HIY + NPC2_NAME + NOR + CYN "的面。" NOR;

        me->set_temp("trace/" + NPC1_ID, 1);

        return CYN "这人武功不高，可是极重义气，跟他兄弟" HIY +
               NPC2_NAME + NOR + CYN "失散后，便四处躲避仇家"
               "的追杀。\n" + knower->name() + CYN "又接着道"
               "：今上午听吃饭的几个家伙提起" HIY + NPC1_NAME +
               NOR + CYN "，据说是躲到" + PLACE1 + NOR + CYN
               "去了。" NOR;
}

// 询问NPC2的状况
string ask_npc2(object knower, object me)
{
        mapping my = query_entire_dbase();

        if ((me->query("score") < 500
           || ! me->query("quest/freequest"))
           && ! me->query_temp("trace/have_ask"))
        {
                me->set_temp("trace/have_ask", 1);
                call_out("do_whisper", 1, knower, me);
        }

        if (! objectp(NPC1) && ! objectp(NPC2))
        {
                call_out("cancel_quest", 1);
                return CYN "嘿嘿，据说" HIY + NPC1_NAME + NOR +
                       CYN "和" HIY + NPC2_NAME + NOR + CYN "哥"
                       "俩终于见面了。啧啧，真不错。" NOR;
        }

        if (! objectp(NPC2))
                return CYN "唉…据说那" HIY + NPC2_NAME + NOR +
                       CYN "最后还是被仇家给做掉了，临死前还惦"
                       "记着" HIY + NPC1_NAME + NOR + CYN "呢。" NOR;

        return "那人跟他兄弟" HIY + NPC1_NAME + NOR + CYN "失散"
               "后，担心得不得了。喏，现在还在" + PLACE2 + NOR +
               CYN "等他兄弟呢。" NOR;
}

// 通知玩家
void do_whisper(object knower, object me)
{
        if (! can_talk_with(knower, me))
                return;

        if (me->query("score") < 500)
                tell_object(me, WHT + knower->name() + WHT "悄悄的和你"
                                "说：算了吧，凭你这两下子，别人不会理你"
                                "的。\n" NOR);
        else
                tell_object(me, WHT + knower->name() + WHT "悄悄的和你"
                                "说：我说呢，你也有事情做，何必去干涉别"
                                "人的私事。\n" NOR);

        me->delete_temp("trace/have_ask");
        message("vision", knower->name() + "在" + me->name() + "的耳边"
                "悄悄的说了些什么。\n", environment(me), ({ me }));
}

// 任务介绍
string query_introduce(object knower)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1) && ! objectp(NPC2))
        {
                call_out("cancel_quest", 1);
                return CYN "嘿嘿，据说" HIY + NPC1_NAME + NOR +
                       CYN "和" HIY + NPC2_NAME + NOR + CYN "哥"
                       "俩终于见面了。啧啧，真不错。" NOR;
        }

        return CYN "听说" HIY + NPC2_NAME + NOR + CYN "和"
               HIY + NPC1_NAME + NOR + CYN "在" + PLACE2 +
               CYN "被仇家围追堵杀，双方火拼了几个时辰，真"
               "是壮烈。\n" + knower->name() + CYN "又接着"
               "说道：唉…那几个仇家倒是被干掉了，可是这么"
               "一对同生共死的兄弟也因此失散了。" NOR;
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
}