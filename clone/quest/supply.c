#include <ansi.h>
#include <quest.h>

inherit QUEST_OB;

#define NPC_OB          my["npc"]       // 接收物品的NPC对象
#define NPC_NAME        my["npc_name"]  // 接收物品的NPC的名字
#define NPC_ID          my["npc_id"]    // 接收物品的NPC的ID
#define PLACE           my["place"]     // 接收物品的NPC的地点
#define SOB_FILE        my["sob_file"]  // 接收物品的文件名字
#define SOB_NAME        my["sob_name"]  // 接收物品的名字
#define COUNT           my["count"]     // 需要物品的数量
#define ZONE            my["zone"]      // 接收对象所处的区域

int  npc_accept_object(object me, object who, object ob);
void npc_destructed();

// 任务对象创建
void create()
{
        seteuid(getuid());
        setup();
}

// 启动一个任务
// 输入一个物品进行寻找，自动生成两个人物和两个地点，其中杀
// 了第一个人即可获得该物品，然后交给第二个人领取奖励。
void init_quest(object npc_ob, string sob_file)
{
        mapping my;

        my = query_entire_dbase();

        // 生成任务的名字
        set_name(npc_ob->name() + "的事");

        if (npc_ob->query_temp("quest_ob"))
        {
                // 这个NPC已经用于其他任务，中止任务
                destruct(this_object());
                return;
        }
        npc_ob->set_temp("quest_ob", this_object());

        // 随即生成需要的物品数量
        COUNT = 3 + random(6);

        // 记录任务的数据信息
        NPC_OB = npc_ob;
        NPC_NAME = npc_ob->name();
        NPC_ID = npc_ob->query("id");
        SOB_FILE = sob_file;
        SOB_NAME = sob_file->name();
        PLACE = environment(npc_ob)->short(1);
        if (sscanf(file_name(environment(npc_ob)), "/d/%s/%*s", ZONE) == 2)
            ZONE = "/d/" + ZONE + "/";
        else
            ZONE = "/";

        // 设置NPC的对话信息
        npc_ob->set("inquiry/" + NPC_NAME, "正是区区在下！");
        npc_ob->set("inquiry/" + NPC_ID, "是我啊，你找对人了！");
        npc_ob->set("inquiry/" + SOB_NAME, "我现在正需要这些东西，你可带来了？");

        // 设置接收物品的信息：由于NPC存在的时候该任务对象必
        // 定会存在（因为任务析构的时候会清除NPC），所以可以
        // 让NPC引用本地的"npc_accept_object"函数。
        npc_ob->set_temp("override/accept_object", (: npc_accept_object :));

        // 设置析构信息：NPC人物析构以后将自动解除任务
        npc_ob->set_temp("override/destruct", (: npc_destructed :));

        // 切换到正常状态
        change_status(QUEST_READY);

        // 设置任务最长存活时间：15分钟
        set("live_time", 600);

        // 登记谣言消息
        register_information();
}

// 恢复NPC：任务结束的时候必须恢复正常的NPC
void restore_npc()
{
        mapping my = query_entire_dbase();
        object npc_ob;

        if (! objectp(npc_ob = NPC_OB))
                return;

        npc_ob->delete_temp("override/accept_object");
        npc_ob->delete_temp("override/destruct");
        npc_ob->delete("inquiry/" + NPC_NAME);
        npc_ob->delete("inquiry/" + NPC_ID);
        npc_ob->delete("inquiry/" + SOB_NAME);
        NPC_OB = 0;
}

// 结束任务
void cancel_quest()
{
        // 恢复NPC，然后结束任务
        restore_npc();

        ::cancel_quest();
}

// 任务NPC消亡
void npc_destructed()
{
        remove_call_out("cancel_quest");
        call_out("cancel_quest", 0);
}

// 询问NPC - 需要提供物品的人
string ask_npc(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC_OB))
                return CYN "哦，据说" HIY + NPC_NAME + NOR CYN
                       "不知道躲到哪儿去了，好多人正骂娘呢。" NOR;

        return "不清楚，不清楚，我又不认识人家！";
}

// 询问SOB - 提供的物品的信息
string ask_sob(object knower, object me)
{
        mapping my = query_entire_dbase();

        return CYN "这" HIY + SOB_NAME + NOR CYN
               "可不是咱们百姓应该沾的东西呀，你说是不是？" NOR;
}

// 任务介绍
string query_introduce(object knower)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC))
        {
                remove_call_out("do_say");
                call_out("do_say", 1);
        }

        return CYN "据说" + PLACE + "的" + HIY + NPC_NAME + NOR CYN "急需一批" +
               HIY + SOB_NAME + NOR CYN "。嘿！你说他想干什么？" NOR;
}

// 任务提示
string query_prompt()
{
        switch (random(3))
        {
        case 0:
                return CYN "倒是最近听有些客人说起『" HIY + name() +
                       NOR CYN "』来。";
        case 1:
                return "也没什么大事，只是听说过『" HIY + name() +
                       NOR CYN "』罢了。";
        default:
                return "前两天还听人家说过『" HIY + name() +
                       NOR CYN "』呢。";
        }
}

void do_say(object knower)
{
        if (! objectp(knower) || ! living(knower))
                return 0;

        message_vision(CYN "$N" CYN "嘟囔道：我跟你都说了，要这些东西没好"
                       "事，这不？出事了吧？\n" NOR, knower);
}

int npc_accept_object(object me, object who, object ob)
{
        mapping my = query_entire_dbase();
        mapping b;

        int exp;
        int pot;
        int score;

        if (ob->is_character() || ob->is_item_make())
                // 不接受人物和自造的兵器
                return 0;

        if (ob->name() != SOB_FILE->name())
                return 0;

        if (me->is_fighting())
                return 0;

        if (base_name(environment(me)) != me->query("startroom"))
        {
                message_vision(CYN "$N" CYN "一脸茫然的望着$n" CYN "。\n" NOR,
                               me, who);
                return -1;
        }

        message_vision(HIY "$N" HIY "大喜，接过" + ob->name() + "看了看，对$n"
                       HIY "道：这位" + RANK_D->query_respect(who) + "，很好，"
                       "很好！\n" NOR, me, who);
        COUNT--;

        message_vision(HIC "$N" HIC "交给了$n" HIC "一些钱作为报酬。\n" NOR,
                       me, who);

        MONEY_D->pay_player(this_player(), SOB_FILE->query("value") * 3 / 2);

        remove_call_out("do_notice");
        if (COUNT < 1)
        {
                // 所有的物品全部接收完了，准备结束任务
                message_vision(HIY "$N" HIY "抹了抹头上的汗，道：总算全备齐了"
                               "，这事可真够罗嗦的。\n" NOR, me);

                CHANNEL_D->do_channel(this_object(), "rumor",
                                      "听说" + who->name(1) +
                                      "(" + who->query("id") + ")替" +
                                      me->name() + HIM + "备齐了" + SOB_NAME + "。");

                call_out("do_finish", 4);
                restore_npc();
                change_status("stopping");
        } else
                call_out("do_notice", 1 + random(3), me, who);

        // 奖励
        exp = 50 + random(50);
        pot = 20 + random(20);
        score = 8 + random(8);
/*
        if (who->query("combat_exp") > 400000)
        {
                // 经验太高，削弱奖励
                exp = exp / 2 + 1;
                pot = pot / 2 + 1;
                score = score / 2 + 1;

                if (who->query("combat_exp") > 500000)
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
                                  "准备" + ob->name() + "的事情" ]);
                set("bonus/" + who->query("id"), b);
                call_out("do_bonus", 2 + random(2), who->query("id"), who);
        }

        destruct(ob);
        return -1;
}

private void do_notice(object me, object who)
{
        mapping my = query_entire_dbase();

        if (! can_talk_with(me, who))
                return;

        message_vision(CYN "$N" CYN "点了点货，又对$n" CYN "道：我还需"
                       "要" + chinese_number(COUNT) + SOB_FILE->query("unit") +
                       SOB_NAME + NOR + CYN  "才够。\n" NOR, me, who);
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

// 登记该任务的消息
void register_information()
{
        mapping my = query_entire_dbase();

        if (! clonep() || ! mapp(my))
                // 不是任务，所以不登记
                return;

        set_information(NPC_NAME, (: ask_npc :));
        set_information(NPC_ID,   (: ask_npc :));
        set_information(SOB_NAME, (: ask_sob :));
}

// 这个任务可以被某人知晓吗？
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
