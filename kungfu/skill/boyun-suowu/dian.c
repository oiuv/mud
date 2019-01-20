#include <ansi.h>

inherit F_SSERVER;

string name()
{
	return("云雾暗点");
}

int perform( object me, object target )
{
	int	ap, dp;
	string	msg;

	if ( !target )
	{
		me->clean_up_enemy();
		target = me->select_opponent();
	}

	if ( me->query_temp( "weapon" ) )
		return(notify_fail( "你只能空手使用「云雾暗点」。\n" ) );

	if ( !me->is_fighting( target ) )
		return(notify_fail( "只能对战斗中的对手使用。\n" ) );

	if ( (int) me->query_skill( "boyun-suowu", 1 ) < 100 )
		return(notify_fail( "你的「拨云锁雾」不够娴熟，不能使用「云雾暗点」。\n" ) );

	if ( (int) me->query_skill( "biyun-xinfa", 1 ) < 100 )
		return(notify_fail( "你的碧云心法不够熟练！\n" ) );

	if ( me->query( "neili" ) < 800 )
		return(notify_fail( "你的内力不够。\n" ) );

	ap	= me->query_skill( "hand" ) + me->query_dex() * 10;
	dp	= target->query_skill( "dodge" ) + target->query_dex() * 10;

	msg = HIG "$N手腕一翻，信手一个拈花诀，内力暗吐，“嗤”的一声，破空而去!\n"NOR;

	message_combatd( msg, me, target );

	me->add( "neili", -500 );

	if ( ap / 2 + random( ap ) > dp )
	{
		if ( !target->is_busy() )
			target->start_busy( ap / 100 + 2 );
		msg = HIC "$n全身顿觉一麻，似乎不能动弹。\n"NOR;
	}else
		msg = HIM "只见$n侧身一让，一阵风声，破空而过！\n"NOR;
	message_combatd( msg, me, target );

	return(1);
}
