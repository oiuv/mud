// time.c

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	write(sprintf("%s现在的时间是：%s。\n" ,
                      HIR + LOCAL_MUD_NAME() + NOR,
                      NATURE_D->game_time()));
	return 1;
}

int help(object me)
{
     write(@HELP
指令格式: time

这个指令让你(你)知道现在的时辰。

HELP
    );
    return 1;
}
