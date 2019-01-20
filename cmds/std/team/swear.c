// team command: swear

#include <ansi.h>

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object *t;
        object env;
        object tob;
        string msg;

        string pure_name;

        // 查验队伍的合法性
        t = me->query_team();
        if (! arrayp(t))
                return notify_fail("你现在并不在队伍中啊。\n");

        if (! me->is_team_leader())
                return notify_fail("只有队伍的领袖才能发话，你先闭嘴。\n");

        if (! arg)
                return notify_fail("结义前先想好一个名字吧！\n");

        t -= ({ 0 });

        if (sizeof(t) < 1)
                return notify_fail("你这个队伍中现在没有别人，结什么义？\n");

        if (me->query_temp("pending/team_doing") &&
            me->query_temp("pending/team_doing") != "swear")
                return notify_fail("你还是等目前队伍中的提议结束了再说吧。\n");

        // 判断命令的合法性
        if (arg == "cancel")
        {
                if (arrayp(t = me->query_temp("pending/team_swear/member")))
                {
                        me->delete_temp("pending/team_swear");
                        write("你取消和大家结义的念头。\n");
                        t -= ({ 0 });
                        message("vision", YEL + me->name(1) +
                                "取消了大家一同结义的倡议。\n", t, me);
                } else
                        write("你现在并没有倡议大家结义啊！\n");

                me->delete_temp("pending/team_doing");
                return 1;
        }

        if (mapp(me->query_temp("pending/team_swear")))
        {
                write("你正倡议大家结义呢！还是等大家回应吧。\n");
                return 1;
        }

        if (me->query("weiwang") < 1000)
        {
                write("你在江湖上无籍籍之名，也来附这风雅？\n");
                return 1;
        } else
        if (me->query("weiwang") < 10000)
        {
                write("你这点名望还不够振臂一呼，聚帮结众，还是以后再说吧。\n");
                return 1;
        } else
        if (me->query("weiwang") < 20000)
        {
                write("你现在在江湖上也算是有些名头了，可惜还是不够。\n");
                return 1;
        } else
        if (me->query("weiwang") < 50000)
        {
                write("你再努力努力提升自己的威望，能"
                      "够聚义结盟的日子也不远了。\n");
                return 1;
        }

        // 判断名字的合法性
        pure_name = arg;
        if (strlen(pure_name) > 12)
                return notify_fail("你这个名字太长了。\n");

        if (strlen(pure_name) < 4)
                return notify_fail("你这个名字太短了。\n");

        if (! is_chinese(pure_name))
                return notify_fail("请你用中文起名字。\n");

        if (stringp(msg = LEAGUE_D->valid_new_league(pure_name)))
                return notify_fail(msg);

        if (strlen(pure_name) != strlen(arg))
                arg += NOR;

        // 判断队伍中所有人的合法性
        env = environment(me);
        foreach (tob in t)
        {
                if (environment(tob) != env)
                        return notify_fail("现在你队伍中的人还没有到齐呢。\n");

                if (! living(tob))
                        return notify_fail("现在你队伍中还有人昏迷不醒呢。\n");

                if (! playerp(tob))
                        return notify_fail("你想结义，只怕" + tob->name(1) + "不答应。\n");

                if (tob->is_fighting())
                        return notify_fail("现在你队伍中有人正忙着打架呢。\n");

                if (mapp(tob->query("league")))
                        return notify_fail("现在你队伍中有人已经加入别的同盟了。\n");
        }

        me->set_temp("pending/team_swear/member", t);

        message_vision("$N大声提议道：“我们众兄弟情"
                       "投意合，今日为何不结拜，共创" +
                       "『" + arg + "』”？\n", me);
        me->set_temp("pending/team_swear/name", pure_name);
        me->set_temp("pending/team_swear/accept", ({ me }));
        me->set_temp("pending/team_doing", "swear");

        foreach (tob in t)
        {
                if (tob == me)
                        continue;

                tell_object(tob, HIG + me->name(1) + "(" +
                            me->query("id") + ")想让大家一"
                            "同结义，创立『" + arg + "』，"
                            "你是否同意(right/refuse)？\n" + NOR);
        	tob->set_temp("pending/answer/" + me->query("id") + "/right",
                              bind((: call_other, __FILE__, "do_right", tob, me :), tob));
        	tob->set_temp("pending/answer/" + me->query("id") + "/refuse",
        	              bind((: call_other, __FILE__, "do_refuse", tob, me :), tob));
        }

        return 1;
}

int do_right(object me, object ob)
{
        object *t;
        object *r;
        string msg;
        object tob;
        int base;
        string league_name;

	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

        t = ob->query_temp("pending/team_swear/member");
        if (! arrayp(t))
		return notify_fail("人家现在已经不打算结义了。\n");

        if (member_array(me, t) == -1)
                return notify_fail("你现在已经不在人家的结义考虑范围之内了。\n");

        switch (random(8))
        {
        case 0:
                msg = "$N点点头，看了看大家，郑重道：“我没有意见，我同意！”\n";
                break;
        case 1:
                msg = "$N大喜，拍掌大笑道：“正合我意！来！来来！”\n";
                break;
        case 2:
                msg = "$N哈哈大笑，大声道：“很好！很好！真是不错！”\n";
                break;
        case 3:
                msg = "$N只是热泪盈眶，道：“甚好！他日行走江湖，那是何等的威风？”\n";
                break;
        case 4:
                msg = "$N点头颔首，伸出一指点点大家，道：“天下豪杰，尽皆于此，可喜啊！”\n";
                break;
        case 5:
                msg = "$N一声长叹，道：“$l此言极是，道出我心中多年之愿！”\n";
                break;
        case 6:
                msg = "$N环顾四方，豪气顿发，道：“$l之言我谨随无异！”\n";
                break;
        case 7:
                msg = "$N喝道：“早有今日之事，江湖怎会忒多争端？此举甚妙！”\n";
                break;
        default:
                msg = "$N连道：“妙！妙！妙不可言！今日良辰，更待合适？”\n";
                break;
        }
        msg = replace_string(msg, "$l", ob->name(1));
        message_vision(msg, me, ob);

        r = ob->query_temp("pending/team_swear/accept");
        if (! arrayp(r) || sizeof(r) < 1)
                r = ({ me });
        else
                r += ({ me });

        if (sizeof(t) == sizeof(r) && ! sizeof(t - r) && ! sizeof(r - t))
        {
                string fail = 0;

                // 全部同意，检查是否能够完成的条件，同时计算
                // 结义的名望。
                base = 10000;
                foreach (tob in t)
                {
                        if (! objectp(tob) || environment(tob) != environment(me))
                        {
                                fail = "虽然大家都同意"
                                       "了，可惜现在有人不在，$N";
                                       "的提议只好作罢。\n";
                                break;
                        }

                        if (! living(tob) || tob->is_fighting())
                        {
                                fail = "虽然大家都同意"
                                       "了，可惜现在有人没法和大"
                                       "家一同结义，$N的提议只好作罢。\n";
                                break;
                        }

                        if (mapp(tob->query("league")))
                        {
                                fail = "虽然大家都同意"
                                       "了，可惜" + tob->name() +
                                       "已经加入了别的同盟了，$N的提议只好作罢。\n";
                                break;
                        }

                        base += tob->query("weiwang");
                }

                // 失败了，无法结义
                if (stringp(fail))
                {
                        ob->delete_temp("pending/team_swear");
                        message_vision(fail, ob);
                        return 1;
                }

                // 完成结义
                league_name = ob->query_temp("pending/team_swear/name");
                LEAGUE_D->create_league(league_name, base, t);
                switch (random(3))
                {
                case 0:
                        msg = "听说" + implode(t->name(1), "、") + "结成 「" HIG +
                              league_name + HIM"」，纵横江湖！";
                        break;
                case 1:
                        msg = "据闻" + implode(t->name(1), "、") + "近日聚义，" +
                              "组成了 「" HIG + league_name +  HIM"」 ，震动江湖。";
                        break;
                default:
                        msg = "传说" + implode(t->name(1), "、") + "情投意合，" +
                              "结义成盟，共创 「" HIG + league_name + HIM "」。";
                        break;
                }

                msg = sort_string(msg, 64, strlen("【江湖传闻】某人："))[0..<2];
                CHANNEL_D->do_channel(this_object(), "rumor", msg);
                ob->delete_temp("pending/team_swear");
        } else
                ob->set_temp("pending/team_swear/accept", r);

        return 1;
}

int do_refuse(object me, object ob)
{
        object *t;
//      string msg;

	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

        t = ob->query_temp("pending/team_swear/member");
        if (! arrayp(t))
		return notify_fail("人家现在已经不打算结义了。\n");

        if (member_array(me, t) == -1)
                return notify_fail("你现在已经不在人家的结义考虑范围之内了。\n");

        ob->delete_temp("pending/team_swear");
        message_vision("$N摇了摇头，对$n道：“你们的事情我不管，但是我没有兴趣。”\n",
                       me, ob);
        t -= ({ 0 });
        message("vision", YEL + me->name(1) + "拒绝了" + ob->name(1) +
                "的结义提议。\n" NOR, t, me);
        return 1;
}