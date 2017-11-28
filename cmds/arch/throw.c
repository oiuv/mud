// throw.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object card;
        object ob;
        int can = 0;
        string tstr;
        string unit;
        int time;
        string because;
        string bmsg;

        can = SECURITY_D->valid_grant(me, "(arch)");

        if (! arg)
                return notify_fail("你要把谁送进地狱？\n");

        sscanf(arg, "%s because %s", arg, because);

        // default is 20 minute
        time = 20;
        if (sscanf(arg, "%s %s", arg, tstr) == 2)
        {
                if (sscanf(tstr, "%d%s", time, unit) != 2)
                {
                        sscanf(tstr, "%d", time);
                        unit = "";
                }

                switch (unit)
                {
                case "h": time *= 60;         break;
                case "d": time *= 60 * 24 ;   break;
                case "m": time *= 1440 * 30;  break;
                case "y": time *= 1440 * 365; break;
                }
        }

        if (! time)
                return notify_fail("你要禁闭别人多久？\n");

        ob = find_player(arg);
        if (wiz_level(me) < 1 && ! objectp(ob))
                return notify_fail("没有这个玩家。\n");

        if (! objectp(ob))
        {
                ob = UPDATE_D->global_find_player(arg);
                if (! objectp(ob))
                        return notify_fail("没有这个玩家。\n");

                if (stringp(ob->query("startroom")))
                        ob->move(ob->query("startroom"));
                else
                        ob->move(environment(me));
        }

        if (! ob || ! me->visible(ob))
                return notify_fail("没有这个玩家。\n");

        if (ob == me || time < 0)
                return notify_fail("疯了... 你真是疯了！\n");

        if (wiz_level(ob) > 0)
                return notify_fail("你不能禁闭巫师！\n");

        bmsg = "";
        if (! ob->is_in_prison())
        {
                if (! because)
                {
                        UPDATE_D->global_destruct_player(ob);
                        return notify_fail("送人进监狱你必须有一个理由才行。\n");
                }

                switch (because)
                {
                case "flood":
                case "copy":
                case "rude":
                case "rumor":
                case "bug":
                case "main":
                        break;

                default:
                        UPDATE_D->global_destruct_player(ob);
                        return notify_fail("你这个理由也太不充分了。\n");
                }
        }

        if (! can)
        {
                if (card = present("throw card", me))
                {
                        message("vision", me->name() + "掏出一张卡片，"
                                "滴嘀咕咕的不知道在说些什么，好像"
                                "提到了" + ob->query("name") + "。\n",
                                environment(me), ({ me }));
                        tell_object(me, "你掏出" + card->name() + "，"
                                "口中念念有词：天灵灵！地灵灵！快把" +
                                ob->query("name") + "送到地狱去！\n");
                        time = card->query("time_to_leave");
                        destruct(card);
                        can = 1;
                }
        }

        if (! can)
        {
                UPDATE_D->global_destruct_player(ob);
                return notify_fail("你无权把" + ob->query("name") + "送进地狱！\n");
        }

        if (! ob->is_in_prison())
                log_file("static/throw",
                         sprintf("%s %s send into prison by %s because %s.\n",
		                 log_time(), geteuid(ob), geteuid(this_player(1)), because));

        ob->get_into_prison(me, 0, time);
        UPDATE_D->global_destruct_player(ob, 1);
        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : throw <玩家ID> [ <时间> ] because <理由>
 
这个指令可以让你把某个玩家禁闭一段时间。时间以分钟为单位，可
以用 h 表示小时，d 表示天，m 表示月份，y 表示年。

禁闭他人理由主要如下：
1. 口出污言秽语(rude)
2. 发布他人说的污言秽语(copy)
3. 造谣生事(rumor)
4. 散布重复信息(flood)
5. 使用系统错误，档案待查(bug)
6. 出于维护该玩家档案的目的(main)

see also : free 
HELP );
        return 1;
}
