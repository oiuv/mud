// mem.c

#include <getconfig.h>

inherit F_CLEAN_UP;

string memory_expression(int m);

mixed main(object me, string arg)
{
	object obj;

    if (! SECURITY_D->valid_grant(me, "(wizard)"))
             return 0;

	if (! arg)
    {
	      	write(sprintf( "%s目前共使用 %s bytes 记忆体。\n",
	     		LOCAL_MUD_NAME(), memory_expression(memory_info())));
	     	return 1;
	}

	if (arg == "-m")
        {
		malloc_status();
		write("\n");
        
		return 1;
	}


	seteuid(geteuid(me));
	obj = find_object(arg);
	if (! obj) obj = present(arg, me);
	if (! obj) obj = present(arg, environment(me));
	if (! obj) obj = find_object( resolve_path(me->query("cwd"), arg) );
	if (! obj) return notify_fail("没有这样物件....。\n");

	write(sprintf( "%O 共使用 %s bytes 记忆体。\n", obj, memory_expression(memory_info(obj))));
	return 1;
}

string memory_expression(int m)
{
	float mem;

	mem = m;
	if (mem < 1024 ) return m + "";
	if (mem < 1024*1024)
		return sprintf("%.2f K", (float)mem / 1024);
	return sprintf("%.3f M", (float)mem / (1024*1024));
}

int help(object me)
{
        write(@HELP
指令格式 : mem <物件之名称或档名>

这个指令告诉你某个物件占用的记忆体数量。
若没有指明物件, 则会显示目前游戏所占用的记忆体.
HELP );
    return 1;
}
