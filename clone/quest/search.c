// 玩家任务：search.c

#include <ansi.h>
#include <quest.h>

inherit QUEST_OB;

#define QOB             my["qob"]
#define NPC1            my["npc1"]
#define NPC2            my["npc2"]
#define QOB_NAME        my["qob_name"]
#define NPC1_NAME       my["npc1_name"]
#define NPC2_NAME       my["npc2_name"]
#define QOB_ID          my["qob_id"]
#define NPC1_ID         my["npc1_id"]
#define NPC2_ID         my["npc2_id"]
#define PLACE1          my["place1"]
#define PLACE2          my["place2"]

int npc_accept_object(object me, object who, object ob);
mixed ask_for_qob(object npc2, object qob, string qob_name);

// 任务对象创建
void create()
{
        setup();
}

// 启动一个任务
// 输入一个物品进行寻找，自动生成两个人物和两个地点，其中杀
// 了第一个人即可获得该物品，然后交给第二个人领取奖励。
void init_quest(string qob_name)
{
        string name;
        object qob;
        string place1, place2;
        object npc1, npc2;
        mapping my;

        if (objectp(qob = find_object(qob_name)))
        {
                if (objectp(qob->query_temp("quest_ob")))
                {
                        // 该物品已经存在并用于其他任务，这个任务不能进行
                        destruct(this_object());
                        return;
                }
        } else
                // 生成任务物品
                qob = load_object(qob_name);

        // 记录该物品的任务属性
        qob->set_temp("quest_ob", this_object());

        // 生成任务的名字
        name = "寻找" + filter_color(qob->name());
        set_name(name);

        // 产生两个随机地点
        place1 = NPC_D->random_place(({ "西域" }));
        place2 = NPC_D->random_place(({ "西域", place1 }));

        // 产生两个随机人物
        npc1 = new(CLASS_D("generate") + "/questnpc");
        npc2 = new(CLASS_D("generate") + "/questnpc");

        npc1->set_temp("quest_ob", this_object());
        npc2->set_temp("quest_ob", this_object());

        // 记录这些人物、地点和物品信息
        my = query_entire_dbase();

        QOB = qob;
        QOB_NAME = filter_color(qob->name());
        NPC1 = npc1;
        NPC2 = npc2;
        PLACE1 = place1;
        PLACE2 = place2;
        NPC1_NAME = npc1->name();
        NPC2_NAME = npc2->name();
        QOB_ID = qob->query("id");
        NPC1_ID = npc1->query("id");
        NPC2_ID = npc2->query("id");

        // 物品承载
        qob->move(npc2);

        // 人物出现
        NPC_D->place_npc(npc1, 0, ({ place1 }));
        NPC_D->place_npc(npc2, 0, ({ place2 }));

        // 设置对话信息
        npc1->set("inquiry", ([
                name      : "啊？你知道？快给我，重重有赏！",
                QOB_NAME  : "其实它并不值钱，但是对我却很重要啊！",
                QOB_ID    : "其实它并不值钱，但是对我却很重要啊！",
                NPC1_NAME : "那就是鄙人我了！",
                NPC1_ID   : "那就是鄙人我了！",
                NPC2_NAME : "我也曾听说这人了，但是没有真凭实据啊！",
                NPC2_ID   : "我也曾听说这人了，但是没有真凭实据啊！" ]));

        npc2->set("inquiry", ([
                name      : "全是瞎闹！哪儿的事儿啊！",
                QOB_NAME  : (: ask_for_qob, npc2, qob, qob->name() :),
                QOB_ID    : (: ask_for_qob, npc2, qob, qob->name() :),
                NPC1_NAME : "你让他来和我对质！真是岂有此理！",
                NPC1_ID   : "你让他来和我对质！真是岂有此理！",
                NPC2_NAME : "正是区区，有何贵干？",
                NPC2_ID   : "正是区区，有何贵干？" ]));

        // 设置接收物品的信息：由于NPC存在的时候该任务对象必
        // 定会存在（因为任务析构的时候会清除NPC），所以可以
        // 让NPC引用本地的"npc_accept_object"函数。
        npc1->set_temp("override/accept_object", (: npc_accept_object :));

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

        // 任务消亡
        ::cancel_quest();
}

// user ask npc2 for quest ob
mixed ask_for_qob(object npc2, object qob, string qob_name)
{
        object me;
//      string msg;

        me = this_player();
        if (me->query("special_skill/trick"))
        {
                message_vision(HIM "$N" HIM "瞥了$n" HIM "一眼，咳嗽两声，对着"
                               "$n" HIM "就聊了开来。\n" NOR, me, npc2);

                tell_object(me, HIC "你劝说" + npc2->name() +
                                HIC "将" + qob_name +
                                HIC "交出来，大家都了事。\n" NOR);
                if (me->query_int() > random(40))
                {
                        // 成功了！
                        if (objectp(qob) && environment(qob) == npc2)
                        {
                                message_vision(CYN "$N" CYN "叹了一口气，对$n"
                                               CYN "道：好了好了，你就别多说"
                                               "了！\n" NOR, npc2, me);

                                tell_object(me, HIY + npc2->name() + HIY "把" +
                                            qob_name + HIY "交给了你。\n" NOR);

                                qob->move(me, 1);
                        } else
                        {
                                message_vision(CYN "$N" CYN "叹了口气，对$n" CYN
                                               "说：你就别说了，那东西真的不在我"
                                               "身上！\n" NOR, npc2, me);
                        }
                } else
                        message_vision(CYN "$N" CYN "眼睛一瞪，对着$n" CYN "骂道"
                                       "：滚开！少来给我废话！\n" NOR, npc2, me);
                return 1;
        }

        return "什么破玩艺，我可没有听说过！";
}

// 询问NPC1 - 丢物品的人
string ask_npc1(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return CYN "嘿，据说" HIY + NPC1_NAME + NOR CYN
                       "倒了大霉，先丢" HIY + QOB_NAME + NOR CYN
                       "再丢命，你说人要这么多东西干什么呢？" NOR;

        return CYN "哦，他呀，据说正在" + PLACE1 + "，找他的" +
               HIY + QOB_NAME + NOR CYN "呢！" NOR;
}

// 询问NPC2 - 持有物品的人
string ask_npc2(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC2))
                return CYN "听人说" HIY + NPC2_NAME + NOR CYN
                       "已经被人杀了，啧啧，你看看，惹祸上身吧！" NOR;

        if (me->query("combat_exp") < NPC2->query("combat_exp") / 2)
        {
                remove_call_out("whisper_to");
                call_out("whisper_to", 0, knower, me);
        }

        return CYN "哦，他呀，据说正在" + PLACE2 + "，大家" +
               "都奔他去了，看来他不妙噢！" NOR;
}

// 询问QOB - 物品的信息
string ask_qob(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(QOB))
                return CYN "不就是你争我夺闹的？现在已经没人"
                       "知道那" HIY + QOB_NAME + NOR CYN "的下落了。" NOR;

        return CYN "你说这" HIY + QOB_NAME + NOR CYN
               "究竟是啥？还能比命值钱？真是的！" NOR;
}

void whisper_to(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! can_talk_with(me, knower))
                return;

        message("vision", knower->name() + "悄悄的在" +
                me->name() + "耳边说了些什么。\n",
                environment(me), ({ me }));
        tell_object(me, WHT + knower->name() + WHT "悄悄的和你说：" +
                    RANK_D->query_respect(me) + "，我看你就别淌"
                    "这浑水了，" + NPC2_NAME + WHT "厉害着呢！\n" NOR);
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

        return CYN "听说" HIY + NPC1_NAME + NOR CYN "丢了" +
               HIY + QOB_NAME + NOR CYN "，有人说不知怎么的就落到了"
               HIY + NPC2_NAME + NOR CYN "手中了。" NOR;
}

void do_say(object knower)
{
        if (! objectp(knower) || ! living(knower))
                return 0;

        message_vision(CYN "$N" CYN "又自言自语道：结果你争我夺的，"
                       "这不，果然就没什么好下场！\n" NOR, knower);
}

int npc_accept_object(object me, object who, object ob)
{
        mapping my = query_entire_dbase();
        object reward;
        int percent;
//      string msg;

        if (ob != QOB)
        {
                message_vision(CYN "$N" CYN "瞪着$n" CYN "，看了半天"
                               "才道：这是什么？\n" NOR, me, who);
                return 0;
        }

        message_vision(HIY "$N" HIY "大喜过望，对$n" HIY "说道：这位"
                       + RANK_D->query_respect(who) + "，太感谢了，"
                       + RANK_D->query_self(me) + "实在不知道该怎么"
                       "报答你！\n" NOR, me, who);

        reward = new("/clone/money/gold");
        reward->set_amount(1);

        message_vision(HIC "$N" HIC "掏出了一些" NOR + YEL "黄金" HIC
                       "双手奉上，感激道：一点薄礼，不成敬意，不成敬"
                       "意！\n" NOR, me, who);

        reward->move(who, 1);

        // 奖励
        percent = 10000 * 100 / (random(who->query("score") + 1) + 10000);

        GIFT_D->bonus(who, ([ "exp" : 200 + random(100),
                              "pot" : 150 + random(100),
                              "score" : 30 + random(20),
                              "percent" : percent ]));

        CHANNEL_D->do_channel(find_object(QUEST_D), "rumor",
                              "听说" + who->name(1) + "(" +
                              who->query("id") + ")替" +
                              me->name() + HIM "找到了" + ob->name() +
                              HIM "，平息了一场武林风波。" NOR);

        // 被列为门派中断的自由任务
        if (who->query("quest/freequest") > 0)
                GIFT_D->delay_freequest_bonus(who);

        // 结束任务
        destruct(ob);
        call_out("cancel_quest", 2);
        return -1;
}

// 这个消息能够被散布吗？
int can_rumor_by(object knower)
{
        // 20%的几率被散布
        return (random(10) < 2);
        //return 0;
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
        set_information(QOB_NAME, (: ask_qob :));
        set_information(NPC1_ID, (: ask_npc1 :));
        set_information(NPC2_ID, (: ask_npc2 :));
        set_information(QOB_ID, (: ask_qob :));
}
