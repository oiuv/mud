/*
 * This program is a part of NITAN MudLIB
 * meng.c 「回梦」
 */

#include <ansi.h>

inherit F_SSERVER;

string name()
{
	return("回梦");
}

int perform( object me, object target )
{
	int	ap, dp, damage;
	string	msg;

	if ( !target )
		target = offensive_target( me );

	if ( !target || !target->is_character() || !me->is_fighting( target ) )
		return(notify_fail( "「回梦」只能对战斗中的对手使用。\n" ) );

	if ( me->query_temp( "weapon" ) )
		return(notify_fail( "你必须空手才能使用「回梦」！\n" ) );

	if ( (int) me->query_skill( "boyun-suowu", 1 ) < 140 )
		return(notify_fail( "你的拨云锁雾不够娴熟，不会使用「回梦」。\n" ) );

	if ( (int) me->query_skill( "biyun-xinfa", 1 ) < 130 )
		return(notify_fail( "你的碧云心法不够高，不能用来反震伤敌。\n" ) );

	if ( me->query( "neili" ) < 300 )
		return(notify_fail( "你现在内力太弱，不能使用「回梦」。\n" ) );

	msg = CYN "$N默念口诀，使出「拨云锁雾」之「回梦」，意欲以内力震晕$n。\n"NOR;

	ap	= me->query_skill( "hand" );
	dp	= target->query_skill( "force" );
	if ( ap / 2 + random( ap ) > dp )
	{
		me->start_busy( 2 );
		/* target->start_busy(random(3)); */

		damage = me->query_skill( "hand" ) * 3 / 5;

		target->receive_damage( "qi", damage );
		target->receive_wound( "qi", damage / 2 );
		me->add( "neili", -300 );

		if ( damage < 20 )
			msg += HIY "结果$n受到$N的内力反震，闷哼一声，看上去很是疲惫。\n"NOR;
		else if ( damage < 40 )
			msg += HIY "结果$n被$N以内力反震，只觉得胸中烦闷，只想好好休息休息。\n"NOR;
		else if ( damage < 80 )
			msg += RED "结果$n被$N以内力一震，脑中嗡嗡作响，意识开始模糊起来！\n"NOR;
		else
			msg += HIR "结果$n被$N的内力一震，眼前一黑，向后便倒，眼看就要不醒人事了！\n"NOR;
	}else  {
		me->start_busy( 3 );
		msg += CYN "可是$p看破了$P的企图，并没有上当。\n"NOR;
	}
	message_combatd( msg, me, target );

	return(1);
}
