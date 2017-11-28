// pkd.c

#include <ansi.h>
#include <localtime.h>

inherit F_DBASE;

#define ENTRY_ROOM      "/d/pk/entry"
#define READY_ROOM      "/d/pk/ready"
#define PK_ROOM         "/d/pk/turen"

// the state of daemon
STATIC_VAR_TAG int state;

#define SLEEPING        0
#define GET_READY       1
#define STARTING        2

#define GET_READY_TIME  180

STATIC_VAR_TAG object *total = ({ });
STATIC_VAR_TAG int ready_time = 0;

// 四次比赛列表
STATIC_VAR_TAG mapping *tlist = ({
([      "name" : "屠人热身赛",
        "time" : ({ 2200, 2210, }),
        "exp"  : ({ 1000, 300000 }),
        "last_day" : 0,
]),
([      "name" : "屠人准备赛",
        "time" : ({ 400, 410, }),
        "exp"  : ({ 1000, 600000 }),
        "last_day" : 0,
]),
([      "name" : "屠人选拔赛",
        "time" : ({ 1000, 1010, }),
        "exp"  : ({ 1000, 2000000 }),
        "last_day" : 0,
]),
([      "name" : "屠人大赛",
        "time" : ({ 1600, 1610 }),
        "exp"  : ({ 1000, 2000000000 }),
        "last_day" : 0,
])
});

STATIC_VAR_TAG int selected;

private void change_state(int new_state);
private void init_player(object me);
private int  start_competition();
private void message_competition(string msg);
private void auto_check();
private void give_bouns(object me);
private void kickout_players();
private void restore_status(object me);
private void send_invite_message();

// 外部可调用的函数
int check_out(object me);

// return the time of prompt
int is_pking()              { return state == STARTING; }
int is_ready()              { return state == GET_READY; }

void create()
{
        seteuid(ROOT_UID);
        set("channel_id", "比赛精灵");
        //write("比赛精灵已经启动。\n");
        CHANNEL_D->do_channel( this_object(), "sys", "比赛精灵已经启动。");
        state = SLEEPING;
        set_heart_beat(30);
}

int clean_up()
{
        return 1;
}

// join in competition
int join_competition(object ob)
{
        if (state != SLEEPING)
                return notify_fail("现在屠人场正在举行活动，你还是等等再说吧。\n");

        if (ob->query("combat_exp") < 800000
           && ! ob->query_temp("team_fight"))
                return notify_fail("你这点本事就别进去啦。\n");

        if (ob->query_condition())
                return notify_fail("你现在状态不佳，还是别进去了。\n");

        if (! arrayp(total))
                total = ({ ob });
        else
        if (member_array(ob, total) == -1)
                total += ({ ob });

        message_competition((ultrap(ob) ? "大宗师" : "") +
                            ob->name(1) + "进入屠人场。");

        init_player(ob);
        set_heart_beat(1);
        return 1;
}

// scan
private void heart_beat()
{
        mixed lt;
        int ti;
        int i;
        int last_day;

        seteuid(ROOT_UID);
        lt = localtime(time());
        ti = lt[LT_HOUR] * 100 + lt[LT_MIN];

        switch (state)
        {
        case SLEEPING:
                last_day = time() / 86400;
                for (i = 0; i < sizeof(tlist); i++)
                {
                        if (ti < tlist[i]["time"][0] || ti > tlist[i]["time"][1])
                                // not change state
                                continue;
                        if (last_day == tlist[i]["last_day"])
                                // this day has do it
                                break;
                        tlist[i]["last_day"] = last_day;
                        selected = i;

                        // chanage state to "GET_READY";
                        change_state(GET_READY);
                        break;
                }
                break;

        case GET_READY:
                if (time() < ready_time + GET_READY_TIME)
                        break;

                // change state to "GET_READY_2";
                change_state(STARTING);
                break;

        case STARTING:
                break;
        }

        if (sizeof(total))
                auto_check();
}

// the daemon change to a new state
private void change_state(int new_state)
{
        mixed lt;
        int n;

        lt = localtime(time());
        switch (new_state)
        {
        case GET_READY:
                // kickout the player now in competition
                kickout_players();

                ready_time = time();
                message_competition("听说一年一度的" + tlist[selected]["name"] + "马上就要"
                                    "举行了，不知道今年的冠军是谁？");
                set_heart_beat(1);
                send_invite_message();
                break;

        case STARTING:
                if (! (n = start_competition()))
                {
                        message_competition("听说今年的" + tlist[selected]["name"] + "因故"
                                            "取消了，真是没劲。");
                        new_state = SLEEPING;
                } else
                {
                        message_competition("听说今年的" + tlist[selected]["name"] +
                                            "吸引了" + chinese_number(n) +
                                            "名高手！走...看看热闹去。");
                        set_heart_beat(1);
                }
                break;

        default:
                total = ({ });
                break;
        }

        // change to new state
        state = new_state;
        if (state == SLEEPING)
                set_heart_beat(30);
        return;
}

// set player's override functions
private void init_player(object me)
{
        tell_object(me, HIY "你眼前忽然一花……\n" NOR);
        me->set_override("unconcious", (: call_other, __FILE__, "check_out" :));
        me->set_override("die", (: call_other, __FILE__, "check_out" :));
        me->set_override("quit", (: call_other, __FILE__, "check_quit" :));
        me->set_temp("backup/killer", me->query_killer());
        me->set_temp("backup/want", me->query_want());

        me->move(sprintf(PK_ROOM "%d", random(12) + 1));
        tell_object(me, HIY "你定神一看，这才发现自己已经到了" +
                            environment(me)->short() + HIY "。\n");
        me->set("backup/condition", me->query_condition());
        me->clear_condition();
}

// kickout the players in competition when formal competition
// get ready
private void kickout_players()
{
        object ob;
        string room;
        mapping my;

        if (! arrayp(total))
                return;

        foreach (ob in total)
        {
                if (! objectp(ob))
                        continue;
                room = base_name(environment(ob));
                if (! sscanf(room, PK_ROOM "%*s"))
                        // not in pk room
                        continue;

                my = ob->query_entire_dbase();
                my["eff_qi"] = my["max_qi"];
                my["eff_jing"] = my["max_jing"];
                my["qi"] = 1;
                my["jing"] = 1;

                tell_object(ob, HIC "\n乌老大走了过来，嚷嚷道：“清场了！清场了，都快走吧！”\n" NOR);

                restore_status(ob);
                ob->move(ENTRY_ROOM);
                message("vision", "只见" + ob->name() + "悻悻的走了出来。\n",
                        environment(ob), ({ ob }));
                if (! living(ob))
                        ob->revive();
        }
}

// start competition, overide all the player's unconcios/die
// function
private int start_competition()
{
        object env;
        object *obs;
//      object shadow;
        int i;

        env = find_object(READY_ROOM);
        if (! objectp(env))
                return 0;

        obs = filter_array(all_inventory(env), (: userp($1) && ! wizardp($1) :));
        if (sizeof(obs) < 2)
                return 0;

        if (sizeof(obs) == 2)
        {
                if (obs[0]->query("couple/id") == obs[1]->query("id"))
                {
                        message_vision("乌老大在外面喊道：“就你们夫妻"
                                       "俩个参加？还是算了吧。”\n", obs[0]);
                        return 0;
                }
        }

        message("vision", "一个黑影走了过来，打开"
                "了门，冷冷道：“都进去吧！”\n", env);

        for (i = 0; i < sizeof(obs); i++)
        {
                reset_eval_cost();
                init_player(obs[i]);
        }

        set_heart_beat(1);
        message("vision", HIG "屠人比赛已经开始，快动手吧！\n", obs);
        return sizeof(total = obs);
}

// send message out
private void message_competition(string msg)
{
        CHANNEL_D->do_channel(this_object(), "rumor", msg);
}

// check all the players who join the competition
private void auto_check()
{
        object ob;
        string msg;
        string room;
        object *lost;
        int i;

        lost = ({ });
        for (i = 0; i < sizeof(total); i++)
        {
                if (! objectp(total[i]))
                        continue;
                room = base_name(environment(total[i]));
                if (! sscanf(room, PK_ROOM "%*s"))
		{
                        // not in pk room
                        restore_status(total[i]);
                        total[i] = 0;
		}
                if (total[i]->query("qi") < 1 || total[i]->query("jing") < 1)
                        lost += ({ total[i] });
        }

        // kickout the players who lost competition
        foreach (ob in lost)
                check_out(ob);

        total -= ({ 0 });
        if (state == SLEEPING)
        {
                if (sizeof(total) < 1)
                        // end of competition. call the change_state
                        // function to restore the normal heart beat.
                        change_state(SLEEPING);

                return;
        }

        if (state != STARTING)
                return;

        if (sizeof(total) < 1)
        {
                msg = "听说屠人大赛参赛者死的死，逃的逃，现在一个人都没有啦！";
        } else
        if (sizeof(total) == 1)
        {
                // change the daemon's state
                msg = "听说本次屠人大赛圆满结束，" +
                      total[0]->name(1) + "成为屠人冠军！";
                give_bouns(total[0]);
        } else
        if (sizeof(total) == 2 && total[0]->query("couple/id") == total[1]->query("id"))
        {
                msg = "听说本次屠人大赛圆满结束，" +
                      total[0]->name(1) + "和" + total[1]->name(1) +
                      "夫妻双双把家还。";
                give_bouns(total[0]);
                give_bouns(total[1]);
        } else
                return;

        message_competition(msg);
        change_state(SLEEPING);
}

private void give_bouns(object me)
{
        int exp;
        int pot;
        string msg;

        // lead me out
        restore_status(me);
        tell_object(me, "这次真是爽呆了……\n");
        me->move(ENTRY_ROOM);
        message("vision", me->name() + "慢慢的走了过来，一脸奸笑。\n",
                environment(me), ({ me }));

        // bouns
        pot = me->query_potential_limit();
        pot -= me->query("potential");
        exp = me->query("combat_exp") / 500 + 3000;
        msg = HIG "通过这次大赛，你获得了 " + (string)exp + " 点经验";
        if (pot > 0)
        {
                pot = random(pot) * 10 + 1000;
                msg += "和 " + (string) pot + " 点潜能。\n" NOR;
        } else
        {
                pot = 0;
                msg += "。\n" NOR;
        }
        me->add("potential", pot);
        me->add("combat_exp", exp);
        tell_object(me, msg);
}

// remove overide function
// restore condition
private void restore_status(object me)
{
        mapping cnd;
        string *ks;
        int i;

        me->delete_override("unconcious");
        me->delete_override("die");
        me->delete_override("quit");
	me->remove_all_enemy(1);
	me->remove_all_killer();
	me->clear_condition();
	me->receive_damage("qi", 0);
        me->apply_killer(me->query_temp("backup/killer"));
        me->apply_want(me->query_temp("backup/want"));

        cnd = me->query("backup/condition");
        me->delete("backup/condition");
	me->delete_temp("block_msg/all");
        if (! mapp(cnd)) return;
        ks = keys(cnd);
        for (i = 0; i < sizeof(ks); i++)
                me->apply_condition(ks[i], cnd[ks[i]]);
}

// send invite message
private void send_invite_message()
{
        object *obs;
        int exp_ul, exp_dl;

        exp_dl = tlist[selected]["exp"][0];
        exp_ul = tlist[selected]["exp"][1];
        obs = filter_array(all_interactive(),
                           (: ! wizardp($1) &&
                              $1->query("combat_exp") >= $(exp_dl) &&
                              $1->query("combat_exp") <= $(exp_ul) :));
        if (! sizeof(obs))
                return;

        message("vision", HIR "你收到了乌老大撒下的武林盟帖，邀请你参加这次" +
                          tlist[selected]["name"] + "，有没有兴趣去显显身手？\n" NOR,
                obs);
}

int start_by_others(int n)
{
        if (state == STARTING)
                return notify_fail("现在比赛正在进行中。\n");

        if (state == GET_READY)
                return notify_fail("现在比赛正在报名中。\n");

        if (n < 0 || n >= sizeof(tlist))
                return notify_fail("没有这个等级的比赛(0-" +
                                   (sizeof(tlist) - 1) + ")。\n");
        selected = n;
        change_state(GET_READY);
        return 1;
}

object *query_all_competitor()
{
        return total;
}

// overide function of quit
int check_quit(object me)
{
        message_competition("听说" + me->name(1) +
                            "临阵脱逃，溜走了。");
        restore_status(me);
        if (arrayp(total))
                total -= ({ me });

        tell_object(me, "你逃出了屠人场。\n");

        // continue run quit function
        me->move(ENTRY_ROOM);
        message("vision", "只见" + me->name() + "慌里慌张的跑了出来。\n",
                environment(me), ({ me }));
        return 1;
}

// overide function of lost(die/unconcious)
int check_out(object me)
{
        object ob;
        mapping my;
        string msg;
        string room;

        room = base_name(environment(me));
        if (! sscanf(room, PK_ROOM "%*s"))
        {
                // not in pk room
                total -= ({ me });
                return 0;
        }

        my = me->query_entire_dbase();
        my["eff_qi"] = my["max_qi"];
        my["eff_jing"] = my["max_jing"];
        my["qi"] = 1;
        my["jing"] = 1;

        tell_object(me, HIR "\n你觉得眼前一阵模糊……这下完了！\n" NOR);
        if (ob = me->query_last_damage_from())
        {
                msg = "听说" + me->name(1) + "惨遭" + ob->name(1) + "的毒手，被无情淘汰。";
        } else
                msg = "听说" + me->name(1) + "运气不佳，本领有限、已经惨遭淘汰。";
        message_competition(msg);

        restore_status(me);
        total -= ({ me });
        me->move(ENTRY_ROOM);
        message("vision", "一个黑影倏的窜了出来，随即就是“啪”的"
                "一声，就见" + me->name() +"摔倒了地上，一副半死不"
		"活的样子。\n", environment(me), ({ me }));
	tell_object(me, "半昏半迷中，你觉得被人拎了起来，又"
		    "重重的摔倒了地上。\n");
        if (! living(me))
                me->revive();
        return 1;
}

// reject_join?
string reject_join(object me)
{
        int exp;

        if (state == STARTING)
                return "现在" + tlist[selected]["name"] + "正在举行，"
                       "你还是下次再来吧。";

        if (state != GET_READY)
                return "现在没要举行比赛啊？你跑来干什么？";

        exp = me->query("combat_exp");
        if (exp < tlist[selected]["exp"][0])
                return "你还是算了吧，你这点经验就别进去现眼了。";

        if (exp > tlist[selected]["exp"][1])
                return "哦…您武功如此高强，这次还是别和小辈们争了。";

        return 0;
}