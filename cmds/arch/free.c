// free.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object ob;
        object card;
        int time;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

	if (! arg)
                return notify_fail("你要把谁带出地狱？\n");

        if (sscanf(arg, "%s %d", arg, time) != 2)
                time = 0;

        ob = find_player(arg);
        if (! ob || ! me->visible(ob))
                return notify_fail("没有这个玩家。\n");

        if (! ob->is_in_prison())
                return notify_fail("这个玩家现在没有被禁闭。\n");

        if (! SECURITY_D->valid_grant(me, "(arch)"))
        {
                if (! objectp(card = present("help card", me)))
                        return notify_fail("你没有权利把人放出来。\n");

                message_vision("$N摸出一张卡片，拼命念叨：太上老君救命啊，" +
                               ob->name(1) + "真是无辜啊！\n", me);
                destruct(card);
        }

        ob->leave_prison(me, time);
        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : free <玩家ID>
 
这个指令可以让你把被禁闭的玩家释放出来。

see also : throw
 
HELP
    );
    return 1;
}
