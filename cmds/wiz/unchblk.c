// channel block command..
// Modified by Marz, 04/18/96
// updated by doing

#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob;
	
        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg)
		return notify_fail("指令格式: unchblk <player id>\n");
		
	ob = UPDATE_D->global_find_player(arg);
	if (! ob)
                return notify_fail(LOCAL_MUD_NAME() + "并没有这个人！\n");

        if (! ob->query("chblk_on"))
        {
                UPDATE_D->global_destruct_player(ob);
                return notify_fail("这个人的频道目前好好的。\n");
        }

        ob->delete("chblk_on");
        ob->delete("chblk_by");
        write("你打开了" + ob->name(1) + "的频道。\n");
        tell_object(ob, me->name(1) + "打开了你的频道。\n");

        UPDATE_D->global_destruct_player(ob, 1);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : unchblk <玩家>

此命令将打开某个玩家的频道。

HELP );
        return 1;
}
