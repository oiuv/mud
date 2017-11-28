// fang.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me)
{
	object *inv;
	int j = 0, i = 0;

	inv = all_inventory(environment(me));
	while (i < sizeof(inv) && i >= 0)
	{
		if (inv[i]->query_temp("owner") == me)
		{
			message_vision("$N很慈悲地把$n放离，任其回归自然了。\n", me, inv[i]);
			inv[i]->delete_temp("owner");
			inv[i]->delete_temp("owner_id");
			inv[i]->delete_temp("owner_name");
			j = 1;
		}
		i++;
	}
	if (j == 0)
		message_vision("$N想放生，可是没啥可放的。\n", me);
	
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : release

此指令可用于让某动物结束主奴状态，将动物放离。

HELP );
	return 1;
}
