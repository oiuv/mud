/* bjtime.c */
#include <ansi.h>
#include <festival.h>

inherit F_CLEAN_UP;

int main( object me, string arg )
{
	int day, day1, day2, month, *date;
	write( sprintf( "现在的时间是北京时间 " + ctime( time() ) + "。\n" ) );
	date	= localtime( time() );
	month	= date[4] + 1;
	day		= date[3];
	day1	= BEGIN_DAY - day;
	day2	= END_DAY - day;

	if ( month == FETEMONTH )
	{
		if ( day1 > 1 )
			write( sprintf( BBLU HIR "\n\t\t距离" HIY + FETEDAY + HIR "还有" HIY "%s" HIR "天！\t\t\n" NOR,
					chinese_number( BEGIN_DAY - day - 1) ) );
		else if ( day1 == 1 )
			write( sprintf( BBLU HIR "\n\t\t明天是" HIY + FETEDAY + HIR "！\t\t\n\n" NOR ) );
		else if ( day1 == 0 )
			write( sprintf( BBLU HIY "\n\t\t今天是" + FETEDAY + "！\t\t\n\n" NOR ) );
		else if ( day2 > 0 )
			write( sprintf( BBLU HIR "\n\t\t距离" HIY + FETEDAY + HIR "结束还有" HIY "%s" HIR "天！\t\t\n" NOR,
					chinese_number( END_DAY - day ) ) );
		else if ( day2 == 0 )
			write( sprintf( BBLU HIR "\n\t\t今天是" HIY + FETEDAY + HIR "最后一天！\t\t\n" NOR ) );
	}
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
