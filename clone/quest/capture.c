// 玩家任务：capture.c

#include <ansi.h>
#include <quest.h>

inherit QUEST_OB;

#define NPC1            my["npc1"]
#define NPC2            my["npc2"]
#define NPC3            my["npc3"]
#define NPC1_NAME       my["npc1_name"]
#define NPC2_NAME       my["npc2_name"]
#define NPC3_NAME       my["npc3_name"]
#define NPC1_ID         my["npc1_id"]
#define NPC2_ID         my["npc2_id"]
#define NPC3_ID         my["npc3_id"]
#define PLACE1          my["place1"]
#define PLACE2          my["place2"]
#define PLACE3          my["place3"]

string ask_2_for_1();
string ask_3_for_1();
string ask_3_for_2();

// 任务对象创建
void create()
{
        setup();
}

// 启动一个任务
// 自动生成三个追捕对象以及对象的起始地点，任务开始后
// 杀掉第一人可以获得一些奖励以及第二人的讯息，然后再
// 杀掉第二人获得更多的奖励和第三人的讯息，最后杀掉第
// 三人，任务结束。
void init_quest(string qob_name)
{
        string name;
        string place1, place2, place3;
        object npc1, npc2, npc3;
        mapping my;

        // 产生三个随机地点
        place1 = NPC_D->random_place(({ "西域", place1 }));
        place2 = NPC_D->random_place(({ "西域", place2 }));
        place3 = NPC_D->random_place(({ "西域", place3 }));

        // 产生三个随机人物
        npc1 = new(CLASS_D("generate") + "/capturenpc1");
        npc2 = new(CLASS_D("generate") + "/capturenpc2");
        npc3 = new(CLASS_D("generate") + "/capturenpc3");

        npc1->set_temp("quest_ob", this_object());
        npc2->set_temp("quest_ob", this_object());
        npc3->set_temp("quest_ob", this_object());

        // 生成任务的名字
        name = "追杀" + npc1->name();
        set_name(name);

        // 记录追杀对象以及地点信息
        my = query_entire_dbase();

        NPC1 = npc1;
        NPC2 = npc2;
        NPC3 = npc3;
        PLACE1 = place1;
        PLACE2 = place2;
        PLACE3 = place3;
        NPC1_NAME = npc1->name();
        NPC2_NAME = npc2->name();
        NPC3_NAME = npc3->name();
        NPC1_ID = npc1->query("id");
        NPC2_ID = npc2->query("id");
        NPC3_ID = npc3->query("id");

        // 这里三个追杀对象是一起出现的，但是在获得相应的讯
        // 息之前杀掉他们并无奖励
        NPC_D->place_npc(npc1, 0, ({ place1 }));
        NPC_D->place_npc(npc2, 0, ({ place2 }));
        NPC_D->place_npc(npc3, 0, ({ place3 }));

        // 设置对话信息
        npc1->set("inquiry", ([
                name      : "咦？有这回事？有意思，改天我也去瞧瞧。", // NPC1假装不知道
                NPC1_NAME : "不认识，不认识！",
                NPC1_ID   : "不认识，不认识！",
                NPC2_NAME : "这……你还是找别人问吧，这个我可不清楚。",
                NPC2_ID   : "这……你还是找别人问吧，这个我可不清楚。",
                NPC3_NAME : "你说的是谁呀？别说见过，我连听都没听说过。",
                NPC3_ID   : "你说的是谁呀？别说见过，我连听都没听说过。" ]));

        npc2->set("inquiry", ([
                name      : "你要追杀他就去啊，来找我干嘛？真是莫名其妙！",
                NPC1_NAME : (: ask_2_for_1 :),
                NPC1_ID   : (: ask_2_for_1 :),
                NPC2_NAME : "正是在下，有何贵干？",
                NPC2_ID   : "正是在下，有何贵干？",
                NPC3_NAME : "这……你还是找别人问吧，这个我可不清楚。",
                NPC3_ID   : "这……你还是找别人问吧，这个我可不清楚。" ]));

        npc3->set("inquiry", ([
                name      : "我说你这人真是不可理喻，你要追杀他却来找我，我又不认识他。",
                NPC1_NAME : (: ask_3_for_1 :),
                NPC1_ID   : (: ask_3_for_1 :),
                NPC2_NAME : "不清楚，你到底在说谁呀？",
                NPC2_ID   : "不清楚，你到底在说谁呀？",
                NPC3_NAME : "正是在下，有何贵干？",
                NPC3_ID   : "正是在下，有何贵干？" ]));

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

        if (objectp(NPC1))
                destruct(NPC1);

        if (objectp(NPC2))
                destruct(NPC2);

        if (objectp(NPC3))
                destruct(NPC3);

        // 任务消亡
        ::cancel_quest();
}

// 询问NPC2有关NPC1的事情
string ask_2_for_1()
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return "嗯，那家伙不是挂了吗，你问我作甚？";

        switch (random(3))
        {
        case 0:
                return "别说见过，我连听都没听说过。";
        case 1:
                return "我不清楚，我看你还是找别人问问吧。";
        default:
                return "不认识，不认识。";
        }
}

// 询问NPC3有关NPC1的事情
string ask_3_for_1()
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return "嗯，那家伙不是挂了吗，你问我作甚？";

        switch (random(3))
        {
        case 0:
                return "别说见过，我连听都没听说过。";
        case 1:
                return "我不清楚，我看你还是找别人问问吧。";
        default:
                return "不认识，不认识。";
        }
}

// 询问NPC1 - 开始被追杀的人
string ask_npc1(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return CYN "嘿，据说" HIY + NPC1_NAME + NOR CYN "已经让"
                       "人给做了。嘿！我早就料到他会没命。喏，又让我给说"
                       "中了吧。\n" + knower->name() + CYN "接着说道：现"
                       "在又传出消息，上次扰乱六大门派的主谋竟然不是他，"
                       "原来另有其人，是一个叫什么" HIY + NPC2_NAME + NOR
                       + CYN "的亡命徒。\n" + knower->name() + CYN "又说"
                       "道：你来说说看，人有几个脑袋？这几个家伙居然敢一"
                       "次惹恼六大门派，这还有他们活得份吗？" NOR;

        if (me->query("combat_exp") < NPC1->query("combat_exp") / 2)
        {
                remove_call_out("whisper_to1");
                call_out("whisper_to1", 0, knower, me);
        }

	me->set_temp("capture/" + NPC1_ID, 1);
        return CYN "哦，听说最近六大门派已经上" + PLACE1 + "找他去了，我"
               "看他这次是小命不保罗。\n" + knower->name() + CYN "接着说"
               "道：唉，做人就得图个太平，何必去惹那么多麻烦呢？你说对不"
               "？" NOR;
}

// 询问NPC2 - 第二个被追杀的对象
string ask_npc2(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC2) && objectp(NPC1))
                return CYN "我没听说……咦？对了，前几天有个家"
                       "伙挂了，倒是有点像你要找的人。" NOR;

        if (objectp(NPC1))
                return CYN "不清楚，不清楚，我从没听说过有那号"
                       "人！" NOR;

        if (! objectp(NPC2))
                return CYN "你刚才没听到谣言么？听说那个" HIY +
                       NPC2_NAME + NOR CYN "好象也挂了。你瞧瞧"
                       "看，这就是惹是生非的下场。\n" + knower->name()
                       + CYN "接着说道：不过现在又传出了消息，"
                       "扰乱六大门派的主谋竟然也不是他，而是一"
                       "个叫" HIY + NPC3_NAME + NOR + CYN "的人"
                       "在幕后操纵。\n" + knower->name() + CYN
                       "伸个懒腰继续道：啧啧，这些家伙啊，一个"
                       "比一狠！" NOR;

        if (me->query("combat_exp") < NPC2->query("combat_exp") / 2)
        {
                remove_call_out("whisper_to2");
                call_out("whisper_to2", 0, knower, me);
        }

	me->set_temp("capture/" + NPC2_ID, 1);
        return CYN "唉呀呀，又来了一个打探消息的。听说那家伙收"
               "到风声，已经躲了起来。\n" + knower->name() + CYN
               "接着说道：不过前两天倒是有一伙人在店里歇脚，不"
               "知怎么的就谈起了他，听说好象是躲到" + PLACE2 +
               "去了。" NOR;
}

// 询问NPC3 - 最终追杀对象
string ask_npc3(object knower, object me)
{
        mapping my = query_entire_dbase();
/*
        if (! objectp(NPC3) && objectp(NPC1))
        {
                remove_call_out("cancel_quest");
                call_out("cancel_quest", 2);
        }
                return CYN "我没听说……咦？对了，前几天有个家"
                       "伙挂了，倒是有点像你要找的人。" NOR;

        if (! objectp(NPC3) && objectp(NPC2))
        {
                remove_call_out("cancel_quest");
                call_out("cancel_quest", 2);
        }
                return CYN "我没听说……咦？对了，前几天有个家"
                       "伙挂了，倒是有点像你要找的人。" NOR;
*/
        if (objectp(NPC1) || objectp(NPC2))
                return CYN "不清楚，不清楚，我从没听说过有那号"
                       "人！" NOR;

        if (! objectp(NPC3))
                return CYN "死了，全死光了。" HIY + NPC3_NAME +
                       NOR CYN "也让人给做了。你算算，先是" HIY
                       + NPC1_NAME + NOR + CYN "，然后是" HIY +
                       NPC2_NAME + NOR + CYN "，现在又轮到他。"
                       "\n" + knower->name() + CYN "接着说道："
                       "啧啧啧，谁叫他们把该惹的和不该惹的都惹"
                       "完了啊，这下都把命出脱就高兴了。" NOR;

        if (me->query("combat_exp") < NPC3->query("combat_exp") / 2)
        {
                remove_call_out("whisper_to3");
                call_out("whisper_to3", 0, knower, me);
        }

	me->set_temp("capture/" + NPC3_ID, 1);
        return CYN "我说这家伙耐性可真好，等到他同伴全死光了他"
               "才现身，啧啧。\n" + knower->name() + CYN "接着"
               "说道：不过看来他好运也不长，几大门派收到消息后"
               "已经直奔" + PLACE3 + "找他去了。\n" + knower->name()
               + CYN "轻哼一声，接着道：我说吧，人总归会有倒霉"
               "的一天。喏，躲得过初一躲就不过十五。" NOR;
}

void whisper_to1(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! can_talk_with(me, knower))
                return;

        message("vision", knower->name() + "悄悄的在" + me->name()
                + "耳边说了些什么。\n", environment(me), ({ me }));

        tell_object(me, WHT + knower->name() + WHT "悄悄的对你说："
                     + RANK_D->query_respect(me) + "，我看你就别淌"
                    "这浑水了，" + NPC1_NAME + WHT "厉害着呢！\n" NOR);
}

void whisper_to2(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! can_talk_with(me, knower))
                return;

        message("vision", knower->name() + "悄悄的在" + me->name()
                + "耳边说了些什么。\n", environment(me), ({ me }));

        tell_object(me, WHT + knower->name() + WHT "悄悄的对你说："
                     + RANK_D->query_respect(me) + "，我看你就别淌"
                    "这浑水了，" + NPC2_NAME + WHT "厉害着呢！\n" NOR);
}

void whisper_to3(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! can_talk_with(me, knower))
                return;

        message("vision", knower->name() + "悄悄的在" + me->name()
                + "耳边说了些什么。\n", environment(me), ({ me }));

        tell_object(me, WHT + knower->name() + WHT "悄悄的对你说："
                     + RANK_D->query_respect(me) + "，我看你就别淌"
                    "这浑水了，" + NPC3_NAME + WHT "厉害着呢！\n" NOR);
}

// 任务介绍
string query_introduce(object knower)
{
        mapping my = query_entire_dbase();

        if (objectp(NPC1))
                return CYN "唉呀呀，听说" HIY + NPC1_NAME + NOR +
                       CYN "那家伙不知怎么搞的，居然把江湖上六大门"
                       "派全都给惹了，真是有种！\n" + knower->name()
                       + CYN "接着说道：这下一来，六大门派便放出口"
                       "信，只要有人见到他，马上格杀勿论。" NOR;

        if (objectp(NPC2) && ! objectp(NPC1))
                return CYN "你收到消息了吗？上次扰乱六大门派那件事"
                       "，主谋竟然不是" HIY + NPC1_NAME + NOR + CYN
                       "，而是一个叫作" HIY + NPC2_NAME + NOR + CYN
                       "的在背后指使。\n" + knower->name() + CYN
                       "接着说道：提起" HIY + NPC1_NAME + NOR + CYN
                       "的下场也真惨，明明只是个帮凶，结果却先一步"
                       "让人家给做了。" NOR;

        if (objectp(NPC3) && ! objectp(NPC2) && ! objectp(NPC1))
                return CYN "想不到啊想不到！你给猜猜看，上次扰乱六"
                       "大门派的主谋是谁？\n" + knower->name() + CYN
                       "嘿嘿一笑，道：结果啊，既不是" HIY + NPC1_NAME
                       + NOR + CYN "，也不是" HIY + NPC2_NAME + NOR +
                       CYN "，而是一个叫" HIY + NPC3_NAME + NOR + CYN
                       "的人在幕后全权操纵！\n" + knower->name() +
                       CYN "接着说道：现在六大门派已经收到了消息，准"
                       "备全面追击他去了。" NOR;

        if (! objectp(NPC3))
                return CYN "嘿嘿，这下人死光了，也算是太平了。\n" +
                       knower->name() + CYN "白眼一翻道：你算算，先"
                       "是" HIY + NPC1_NAME + NOR + CYN "，然后是"
                       HIY + NPC2_NAME + NOR + CYN "，最后又是" HIY
                       + NPC3_NAME + NOR + CYN "。\n" + knower->name()
                       + CYN "又接着道：啧啧啧，谁叫他们把该惹的和不"
                       "该惹的都惹完了啊，这下都把命出脱就高兴了。" NOR;
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
        set_information(NPC3_NAME, (: ask_npc3 :));
        set_information(NPC1_ID, (: ask_npc1 :));
        set_information(NPC2_ID, (: ask_npc2 :));
        set_information(NPC3_ID, (: ask_npc3 :));
}