// Filename : /cmds/std/unride.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me)
{
	object ob;

	if (! objectp(ob = me->query_temp("is_riding")))
		return notify_fail("你下什么下！根本就没座骑！\n");

	message_vision("$N从$n上飞身跳下。\n", me, ob);
	ob->move( environment(me) );
	ob->delele_temp("is_rided_by");
	me->delete_temp("is_riding");
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : unride | xia
 
这个指令可以让你从骑着的已驯养的动物上跳下来。
 
HELP );
    return 1;
}
