// 玩家任务：deliver.c

#include <ansi.h>
#include <quest.h>

inherit QUEST_OB;

#define QOB             my["qob"]
#define NPC1            my["npc1"]
#define NPC2            my["npc2"]
#define QOB_NAME        my["qob_name"]
#define QOB_UNIT        my["qob_unit"]
#define NPC1_NAME       my["npc1_name"]
#define NPC2_NAME       my["npc2_name"]
#define QOB_ID          my["qob_id"]
#define NPC1_ID         my["npc1_id"]
#define NPC2_ID         my["npc2_id"]
#define PLACE1          my["place1"]
#define PLACE2          my["place2"]
#define AMOUNT          my["amount"]

int npc_accept_object(object me, object who, object ob);
mixed ask_for_qob(object npc2, object qob, string qob_name);

// 任务对象创建
void create()
{
        setup();
}

// 启动一个任务
// 自动生成两个人物和两个地点，输入一种物品进行送货，
// 找到第一个人接到物品，然后送给第二个人领取奖励。
void init_quest(string qob_name, int amount)
{
        string name;
        string place1, place2;
        object npc1, npc2;
        mapping my;
        object qob;

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
        qob->set_amount(amount);

        // 生成任务的名字
        name = "运送" + filter_color(qob->name());
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
        QOB_UNIT = qob->query("base_unit");
        NPC1 = npc1;
        NPC2 = npc2;
        PLACE1 = place1;
        PLACE2 = place2;
        NPC1_NAME = npc1->name();
        NPC2_NAME = npc2->name();
        QOB_ID = qob->query("id");
        NPC1_ID = npc1->query("id");
        NPC2_ID = npc2->query("id");
        AMOUNT = amount;

        // 物品承载，保证送货的NPC拿得动足够的重量
        npc2->set_max_encumbrance(1000000);
        qob->move(npc2);

        // 人物出现
        NPC_D->place_npc(npc1, 0, ({ place1 }));
        NPC_D->place_npc(npc2, 0, ({ place2 }));

        // 设置对话信息
        npc1->set("inquiry", ([
                name      : "啊？你是送它来的？快给我。",
                QOB_NAME  : "那些货物呀，我这里的生意正急需呢！",
                QOB_ID    : "那些货物呀，我这里的生意正急需呢！",
                NPC1_NAME : "那正是本人啊！",
                NPC1_ID   : "那正是本人啊！",
                NPC2_NAME : "是呀，就是他答应派人送来的！",
                NPC2_ID   : "是呀，就是他答应派人送来的！" ]));

        npc2->set("inquiry", ([
                name      : "没错，你愿意去帮我送这批货！",
                QOB_NAME  : (: ask_for_qob, npc2, qob, qob->name() :),
                QOB_ID    : (: ask_for_qob, npc2, qob, qob->name() :),
                NPC1_NAME : "这批货就是要送给他的呀！",
                NPC1_ID   : "这批货就是要送给他的呀！",
                NPC2_NAME : "正是在下，有何贵干？",
                NPC2_ID   : "正是在下，有何贵干？" ]));

        // 设置接收物品的信息：由于NPC存在的时候该任务对象必
        // 定会存在（因为任务析构的时候会清除NPC），所以可以
        // 让NPC引用本地的"npc_accept_object"函数。
        npc1->set_temp("override/accept_object", (: npc_accept_object :));

        // 切换到正常状态
        change_status(QUEST_READY);

        // 设置任务最长存活时间：30分钟
        set("live_time", 1200);

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

        if (objectp(QOB))
                destruct(QOB);

        // 任务消亡
        ::cancel_quest();
}

// user ask npc2 for quest ob
mixed ask_for_qob(object npc2, object qob, string qob_name)
{
        object me;
        object ob;

        me = this_player();

        message_vision(CYN "$N" CYN "对$n" CYN "说道：这" + qob_name +
                       CYN "您就交给我帮您运送吧，咱包您准时送到！\n" NOR,
                       me, npc2);

        tell_object(me, HIC "你让" + npc2->name() + HIC "将" + qob_name +
                        HIC "交托给你运送。\n" NOR);

        if (me->query("score") < 1000)
        {
                message_vision(CYN "$N" CYN "眯着眼睛瞥了$n" CYN "一眼，哼"
                               "了一声道：这批货给你？我可不放心。”\n" NOR,
                               npc2, me);
                return 1;
        }

        if (objectp(qob) && environment(qob) == npc2 && qob->query_amount())
        {
                if (me->query_encumbrance() + qob->weight() / qob->query_amount() <
                    me->query_max_encumbrance())
                {
                        message_vision(CYN "$N" CYN "打量了$n" CYN "半天，"
                                       "点点头道：好吧，这批货可是非常重要"
                                       "的，你一定要准时送到啊。\n" NOR, npc2, me);

                        tell_object(me, HIY + npc2->name() + HIY "把一" +
                                        qob->query("base_unit") + qob_name +
                                        HIY "交给了你托运。\n" NOR);

                        ob = new(base_name(qob));
                        qob->add_amount(-1);
                        if (! objectp(ob))
                        	tell_object(me, CYN + npc2->name() + CYN "突"
                                            "然脸色一变，大叫道：我的" + qob_name +
                                            CYN "呢？怎么不见了？\n" NOR);
                        ob->move(me, 1);
                } else
                {
                        message_vision(CYN "$N" CYN "眯着眼睛瞥了$n" CYN "一"
                                       "眼，叹了口气道：" + RANK_D->query_respect(me) +
                                       CYN "，这批货你运得了么？\n" NOR, npc2, me);
                }
        } else
                message_vision(CYN "$N" CYN "微笑着对$n" CYN "说：不用劳烦"
                               "你了，这批" + qob_name + CYN "已经有人送去"
                               "了。\n" NOR, npc2, me);

        return 1;
}

// 询问NPC1 - 接收货物的人
string ask_npc1(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC1))
                return CYN "唉，怎么" HIY + NPC1_NAME + NOR CYN
                       "好端端的，" HIY + QOB_NAME + NOR CYN
                       "没拿到，反而丢了命，真是可怜。" NOR;

        return CYN "哦，他呀，据说正在" + PLACE1 + "，等人给他送去一批" +
               HIY + QOB_NAME + NOR CYN "呢！" NOR;
}

// 询问NPC2 - 持有物品的人
string ask_npc2(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC2))
                return CYN "听人说" HIY + NPC2_NAME + NOR CYN
                       "居然被人杀了，也不知道惹了哪门子的祸！" NOR;

        if (me->query("score") < 500)
                call_out("do_whisper", 1, knower, me);

        return CYN "哦，他呀，据说正在" + PLACE2 + "，急着等" +
               "人帮他送货呢！" NOR;
}

// 通知玩家
void do_whisper(object knower, object me)
{
        if (! can_talk_with(knower, me))
                return;

        tell_object(me, WHT + knower->name() + WHT "悄悄的和你"
                    "说：“可惜你的江湖阅历太低了，他不会给你运。”\n");
        message("vision", knower->name() + "在" + me->name() +
                "的耳边悄悄的说了些什么。\n", environment(me), ({ me }));
}

// 询问QOB - 物品的信息
string ask_qob(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(QOB))
                return CYN "难不成已经给山贼截去了？居然没人"
                       "知道那" HIY + QOB_NAME + NOR CYN "的下落了。" NOR;

        return CYN "这" HIY + QOB_NAME + NOR CYN + "呀，"
               "不过是很普通的一批货物而已嘛！" NOR;
}

// 任务介绍
string query_introduce(object knower)
{
        mapping my = query_entire_dbase();

        return CYN "听说" HIY + NPC2_NAME + NOR CYN "急需将一批" +
               HIY + QOB_NAME + NOR CYN "送到" HIY + NPC1_NAME + NOR
               CYN "那儿，你有没有兴趣？" NOR;
}

// 任务提示
string query_prompt()
{
        switch (random(3))
        {
        case 0:
                return CYN "倒是最近听来往的商人说起『" HIY + name() +
                       NOR CYN "』的事来。";
        case 1:
                return "也没什么大事，只是听说过『" HIY + name() +
                       NOR CYN "』的事罢了。";
        default:
                return "前两天还听人家说起『" HIY + name() +
                       NOR CYN "』的事呢。";
        }
}

int npc_accept_object(object me, object who, object ob)
{
        mapping my = query_entire_dbase();
        mapping b;
        object reward;
        int exp;
        int pot;
        int score;

        if (ob->is_character() || ob->is_item_make())
        {
                message_vision(CYN "$N" CYN "瞪着$n" CYN "，使劲的摇着头"
                               "道：我要这干什么？\n" NOR, me, who);
                return 0;
        }

        if (ob->query("id") != QOB_ID)
        {
                message_vision(CYN "$N" CYN "瞪着$n" CYN "，使劲的摇着头"
                               "道：我要这干什么？\n" NOR, me, who);
                return 0;
        }

        if (me->is_fighting())
                return 0;

        AMOUNT -= ob->query_amount();

        message_vision(CYN "$N" CYN "看了看" + ob->name() + CYN "，对$n"
                       CYN "道：还不错，辛苦你了。这点银子你收下吧。\n" NOR,
                       me, who);

        reward = new("/clone/money/silver");
        reward->set_amount(ob->query_amount() / 1 + random(3));
        reward->move(who, 1);

        remove_call_out("do_notice");
        if (AMOUNT < 1)
        {
                // 所有的物品全部接收完了，准备结束任务
                message_vision(CYN "$N" CYN "抹了抹头上的汗，道：总算"
                               "全运到了，这事可真够罗嗦的。\n" NOR, me);

                CHANNEL_D->do_channel(find_object(QUEST_D), "rumor",
                                      "听说" + who->name(1) + "(" +
                                      who->query("id") + ")替" +
                                      me->name() + HIM "安全送到了" +
                                      "一批" + ob->name() + HIM "。" NOR);

                call_out("do_finish", 4);
                change_status("stopping");
        } else
                call_out("do_notice", 1 + random(3), me, who, ob);

        // 奖励
        exp = 50 + random(50);
        exp *= ob->query_amount();
        pot = 20 + random(20);
        pot *= ob->query_amount();
        score = 4 + random(4);
        score *= ob->query_amount();
/*
        if (who->query("combat_exp") > 200000)
        {
                // 经验太高，削弱奖励
                exp = exp / 2 + 1;
                pot = pot / 2 + 1;
                score = score / 2 + 1;

                if (who->query("combat_exp") > 400000)
                {
                        // 再次削弱奖励
                        exp = exp / 2 + 1;
                        pot = pot / 2 + 1;
                        score = score / 2 + 1;
                }
        }
 */

          if (who->query("combat_exp") > 1000000)
                {
                        // 再次削弱奖励
                        exp = exp / 2 + 1;
                        pot = pot / 2 + 1;
                        score = score / 2 + 1;
                }



        if (mapp(b = query("bonus/" + who->query("id"))))
        {
                // 正在奖励该人中
                b["exp"] += exp;
                b["pot"] += pot;
                b["score"] += score;
        } else
        {
                b = ([ "exp" : exp,
                       "pot" : pot,
                       "score" : score,
                       "prompt": "经过这次帮助" + me->name() +
                                 "运送" + ob->name() + "的事情" ]);
                set("bonus/" + who->query("id"), b);
                call_out("do_bonus", 2 + random(2), who->query("id"), who);
        }

        destruct(ob);
        return -1;
}

private void do_notice(object me, object who, object ob)
{
        mapping my = query_entire_dbase();

        if (! can_talk_with(me, who))
                return;

        message_vision(CYN "$N" CYN "点了点货，又对$n" CYN "道：我还需"
                       "要" + chinese_number(AMOUNT) + QOB_UNIT + QOB_NAME +
                       CYN "才够。\n" NOR, me, who);
}

// 准备完成任务
private void do_finish()
{
        if (sizeof(query("bonus")) > 0)
        {
                call_out("do_finish", 4);
                return;
        }

        // 该任务已经完成
        cancel_quest();
}

// 给某人奖励
private void do_bonus(string who_id, object who)
{
        mapping b;

        b = query("bonus/" + who_id);
        delete("bonus/" + who_id);

        if (! mapp(b) || ! objectp(who) || ! living(who))
                return;

        GIFT_D->bonus(who, b);
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
