// 玩家任务：explore.c

#include <ansi.h>
#include <quest.h>
#include <command.h>

inherit QUEST_OB;

#define NPC_OB          my["npc"]       // 接收宝物的NPC对象
#define NPC_NAME        my["npc_name"]  // 接收宝物的NPC的名字
#define NPC_ID          my["npc_id"]    // 接收宝物的NPC的ID
#define ENV_OB          my["env_ob"]    // 宝物隐藏的地点
#define QOB             my["qob"]       // 接收宝物的文件名字
#define QOB_NAME        my["qob_name"]  // 接收宝物的名字
#define ZONE            my["zone"]      // 接收对象所处的区域

object search_qob(object me);
int    npc_accept_object(object me, object who, object ob);
void   npc_destructed();

// 任务对象创建
void create()
{
        seteuid(getuid());
        setup();
}

// 启动一个任务
// 输入一个物品进行寻找，自动生成两个人物和两个地点，其中杀
// 了第一个人即可获得该物品，然后交给第二个人领取奖励。
void init_quest(object npc_ob, string qob_name, string zone, string *files)
{
        mapping my;
        string room;
        object env;
        object qob;

        my = query_entire_dbase();

        // 生成任务的名字
        set_name(npc_ob->name() + "的事");

        if (npc_ob->query_temp("quest_ob"))
        {
                // 这个NPC已经用于其他任务，中止任务
                destruct(this_object());
                return;
        }

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

        NPC_OB = npc_ob;
        NPC_NAME = npc_ob->name();
        NPC_ID = npc_ob->query("id");
        QOB    = qob;
        QOB_NAME = qob->name();
        ZONE = zone;

        // 随机选择一个地点
        for (;;)
        {
                call_other(room = zone + files[random(sizeof(files))], "???");
                if (! objectp(env = find_object(room)))
                {
                        // 无法取得这个房间
                        cancel_quest();
                        return;
                }

                if (mapp(env->query("exits")))
                        // 找到了有出口的房间
                        break;
        }

        // 在房间中放置可搜索的对象，并去掉该房间可以找到的
        // 银两和铜板
        env->set_temp("no_search", ([ "/clone/money/coin" : 0,
                                      "/clone/money/silver" : 0, ]));
        env->set_temp("search_objects", ([ (: search_qob :) : 10000 ]));
        env->set_temp("been/searched", -150);
        ENV_OB = env;

        // 设置NPC的对话信息
        npc_ob->set("inquiry/" + NPC_NAME, "正是区区在下！");
        npc_ob->set("inquiry/" + NPC_ID, "是我啊，你找对人了！");
        npc_ob->set("inquiry/" + QOB_NAME, "啊！你...你知道么？快给我！");
        npc_ob->set_temp("quest_ob", this_object());

        // 设置接收物品的信息：由于NPC存在的时候该任务对象必
        // 定会存在（因为任务析构的时候会清除NPC），所以可以
        // 让NPC引用本地的"npc_accept_object"函数。
        npc_ob->set_temp("override/accept_object", (: npc_accept_object :));

        // 设置析构信息：NPC人物析构以后将自动解除任务
        npc_ob->set_temp("override/destruct", (: npc_destructed :));

        // 切换到正常状态
        change_status(QUEST_READY);

        // 设置任务最长存活时间：30分钟
        set("live_time", 1200);

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
        npc_ob->delete("inquiry/" + QOB_NAME);
        NPC_OB = 0;
}

// 恢复ENV：任务结束的时候必须恢复正常的环境
void restore_env()
{
        mapping my = query_entire_dbase();
        object env;

        if (! objectp(env = ENV_OB))
                return;

        // 去掉临时搜索的物品信息
        env->delete_temp("search_objects");
        env->delete_temp("no_search");
        env->set_temp("been/searched", 30);
        ENV_OB = 0;
}

// 结束任务
void cancel_quest()
{
        mapping my = query_entire_dbase();

        // 恢复NPC，然后结束任务
        restore_npc();
        restore_env();

        if (objectp(QOB) && ! environment(QOB))
                destruct(QOB);

        ::cancel_quest();
}

// 任务NPC消亡
void npc_destructed()
{
        call_out("cancel_quest", 0);
}

// 在房屋种找物品
object search_qob(object me)
{
        mapping my = query_entire_dbase();
        mapping dq;
//      int i, exp2, pot2, exc2;      // 强迫freequest所获得的额外奖励
        object ob/*, gift*/;
//      string msg;

        if (me->query("score") < 2000)
                // 必须有2000的江湖阅历才能够找到
                return 0;

        if (! objectp(QOB))
                // 这个物品已经没有了，无法找了
                return 0;

        if (objectp(environment(QOB)))
                // 该物品已经现世，无法找了
                return 0;

        if (! environment(me)->query("no_fight") && random(100) < 10)
        {
                // 找到杀手一名？
                ob = new("/clone/npc/killer");
                ob->move(environment(me));
                message_vision(HIW "\n突然窜出一个黑影，恶狠狠的对$N"
                               HIW "骂道：" + RANK_D->query_rude(me)
                               + "！你在这儿干啥？\n" NOR, me);
                ob->kill_ob(me);
                return 0;
        }

        if (mapp(dq = me->query_temp("freequest")) &&
            dq[this_object()])
        {
                // 如果我询问过这个任务，此时就可以获得奖励
                map_delete(dq, this_object());

                GIFT_D->delay_bonus(me, ([ "exp"   : 100 + random(20),
                                           "pot"   : 30 + random(20),
                                           "score" : 5 + random(4),
                                           "prompt": "在你寻找" + QOB_NAME +
                                                     HIC "的过程中" ]));

                // 被列为门派中断的自由任务
                if (me->query("quest/freequest") > 0)
                        GIFT_D->delay_freequest_bonus(me);
        }
        return QOB;
}

// 询问NPC - 需要提供物品的人
string ask_npc(object knower, object me)
{
        mapping my = query_entire_dbase();

        if (! objectp(NPC_OB))
                return CYN "哦，据说" HIY + NPC_NAME + NOR CYN
                       "不知道去哪儿去了，神秘的失踪了。" NOR;

        return "你说" + NPC_NAME + "啊？我还想向你打听呢！";
}

// 询问QOB - 提供的物品的信息
string ask_qob(object knower, object me)
{
        mapping my = query_entire_dbase();
        mapping dq;
        object env;
        string exits;
        string *str;

        if (! objectp(QOB) || ! objectp(env = ENV_OB) && ! environment(QOB))
                return CYN "据可靠的消息说，" + QOB_NAME + CYN "是"
                       "再也找不着了，再怎么也是白忙活了。" NOR;

        if (environment(QOB))
                return CYN "好像说是有人已经找到" + QOB_NAME +
                       CYN "了，啧啧，怎么就不是我呢？" NOR;

        if (me->query("score") >= 2000)
        {
                if (! mapp(env->query("exits")))
                        exits = "没有出口";
                else
                {
                        str = keys(env->query("exits"));
                        str = map_array(str, (: GO_CMD->query_chinese_dir($1) :));
                        str -= ({ 0 });
                        exits = "大概具有" + implode(str, "、") + "出口";
                }

                message("vision", WHT + knower->name() + "看了看四周，鬼鬼祟祟"
                                  "的在" + me->name() + WHT "耳边说了些什么。\n"
                                  NOR, environment(me), ({ me }));

                tell_object(me, sort_msg(knower->name() + "看了看四"
                            "周，鬼鬼祟祟的在你耳边说道：“你可千万"
                            "别告诉别人呀！这可是我听到的秘密情报，"
                            "今天我不要钱就告诉你了：据说那个东西在一个" +
                            exits + "的地方，离咱们这里也不算太远呢。你"
                            "到那里仔细找找没准会有发现呢！”\n"));

                if (! mapp(dq = me->query_temp("freequest")))
                        dq = ([ this_object() : 1 ]);
                else
                        dq[this_object()] = 1;

                me->set_temp("freequest", dq);
        } else
                message_vision(CYN "$N" CYN "上上下下的打量了$n" CYN "一番，嘴"
                               "角露出一丝不屑的神态。\n" NOR, knower, me);

        return CYN "其实你说这" HIY + QOB_NAME + NOR CYN
               "东西有啥用呢？能比得上鸡腿和酒袋么？" NOR;
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

        return CYN "据说" + HIY + NPC_NAME + NOR CYN "正在托人寻找" +
               HIY + QOB_NAME + NOR CYN "，啧啧，可惜我要看店。" NOR;
}

// 任务提示
string query_prompt()
{
        switch (random(3))
        {
        case 0:
                return CYN "最近听来往的客人谈起过『" HIY + name() +
                       NOR CYN "』来。";
        case 1:
                return "噢！楼上住店的那几个客人刚才说什么『" HIY + name() +
                       NOR CYN "』呢。";
        default:
                return "前两天来过几个江湖人士，一看就是高手，"
                       "他们还说起过『" HIY + name() + NOR CYN "』呢。";
        }
}

void do_say(object knower)
{
        if (! objectp(knower) || ! living(knower))
                return 0;

        message_vision(CYN "$N" CYN "耸耸肩道：“这年头，露财不是好事。"
                       "你看，这不出事了吧？”\n" NOR, knower);
}

int npc_accept_object(object me, object who, object ob)
{
        mapping my = query_entire_dbase();
        mapping b;
        object reward;

        int exp;
        int pot;
        int score;
        int weiwang;

        if (ob->is_character() || ob->is_item_make())
                // 不接受人物和自造的兵器
                return 0;

        if (ob != QOB)
                return 0;

        if (me->is_fighting())
                return 0;

        if (base_name(environment(me)) != me->query("startroom"))
        {
                message_vision("$N望着$n，一副白痴模样。\n", me, who);
                return -1;
        }

        message_sort(HIY "\n$N" HIY "接过" + ob->name() + HIY "，翻来覆去看"
                     "了看，喜不自胜，一时间是激动万分。半晌才对$n" HIY "道"
                     "：这位" + RANK_D->query_respect(who) + "，实在是感激"
                     "不尽，这点小意思，务必笑纳！\n" NOR, me, who);

        message_vision(HIC "$N" HIC "交给$n" HIC "一些" NOR + YEL "黄金"
                       HIC "作为报酬。\n" NOR, me, who);

        reward = new("/clone/money/gold");
        reward->set_amount(1);
        reward->move(who, 1);

        // 奖励
        exp = 200 + random(200);
        pot = 150 + random(150);
        score = 15 + random(15);
        weiwang = 5 + random(5);

        b = ([ "exp"     : exp,
               "pot"     : pot,
               "score"   : score,
               "weiwang" : weiwang,
               "prompt"  : "在寻找" + QOB_NAME + HIC
                           "的过程中，经过锻炼" ]);
        GIFT_D->delay_bonus(who, b);

        CHANNEL_D->do_channel(this_object(), "rumor",
                              "听说" + who->name(1) +
                              "(" + who->query("id") +
                              ")替" + me->name() + HIM +
                              "找到了" + QOB_NAME + HIM
                              "，领到了赏银。" NOR);

        destruct(ob);
        call_out("cancel_quest", 0);
        return -1;
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
        set_information(QOB_NAME, (: ask_qob :));
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
