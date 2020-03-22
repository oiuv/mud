/* bjtime.c */
#include <ansi.h>

inherit F_CLEAN_UP;

int main( object me, string arg )
{
    write(sprintf("现在的时间是北京时间 " HIG + ctime( time() ) + NOR "。\n" ) );

    return(1);
}

int help(object me)
{
     write(@HELP
指令格式: time

这个指令告诉你现实世界中现在的时间。

HELP);
    return 1;
}
