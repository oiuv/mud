// snoop.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string msg;
        object sob;
	object ob;

	if (! interactive(me))
		return 0;

	if (! arg)
	{
		if (objectp(ob = query_snooping(me)))
			write("你现在正在监听" + ob->query("name") +
			      "所收到的讯息。\n");
                else
                        write("你现在没有监听任何人。\n");

		return 1;
	} else
        if (arg == "none")
	{
		snoop(me);
		write("Ok.\n");
		return 1;
	} else
        if (sscanf(arg, "-i %s", arg) || arg == "-i")
        {
                if (! SECURITY_D->valid_grant(me, "(admin)"))
                {
                        write("参数错误。\n");
                        return 1;
                }

                if (arg == "-i")
                        ob = me;
                else
                        ob = find_player(arg);
                if (! objectp(ob))
                {
                        write("没有找到 " + arg + " 这个玩家，无法查看信息。\n");
                        return 1;
                }

                msg = "目前有关" + ob->name(1) + "(" + geteuid(ob) + ")的监听情况如下：\n";
                if (objectp(sob = query_snooping(ob)))
                        msg += "正在监听" + sob->name(1) + "(" + geteuid(sob) +
                               ")收到的信息。\n";
                else
                        msg += "没有监听任何人。\n";

                if (objectp(sob = query_snoop(ob)))
                        msg += "正在被" + sob->name(1) + "(" + geteuid(sob) +
                               ")窃听。\n";
                else
                        msg += "没有被任何人窃听。\n";

                write(msg);
                return 1;
        }

	ob = find_player(arg);
	if (! ob) ob = find_living(arg);
	if (! ob || ! me->visible(ob))
		return notify_fail("没有这个人。\n");

	if (! interactive(ob))
		return notify_fail("这个玩家不在线上，无法监听。\n");

	if (! is_sub(me->query("id"), ob->query("env/can_snoop")) &&
            ! SECURITY_D->valid_grant(me, "(arch)"))
		return notify_fail("这个玩家不允许你监听。\n");

	if (wiz_level(ob) > wiz_level(me))
		return notify_fail("你的权限不够监听对方。\n");

	if (me == ob) return notify_fail("请用 snoop none 解除监听。\n");
		
	snoop(me, ob);
	write("你现在开始窃听" + ob->name(1) + "所收到的讯息。\n");
	if (playerp(ob)) log_file("snoop",
		sprintf("%s(%s-%s) snoops %s on %s.\n", me->name(1),
			geteuid(me), query_ip_number(ob), ob->name(1),
			ctime(time()) ) );

	return 1;
}

int help()
{
	write(@TEXT
指令格式：snoop <某人> | none | -i <某人>

监听其他使用者所收听的讯息，snoop none 则取消监听。你监听
对方的前提是对方允许你这么做，即设置了 can_snoop 为你的ID。

使用 -i 参数可以查看某人目前窃听的信息。
TEXT );
	return 1;
}
