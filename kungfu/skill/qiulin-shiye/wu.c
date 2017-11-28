#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

string name()
{
	return("随风而舞");
}

int perform( object me, object target )
{
	string	msg;
	object	env		= environment( me );
	mapping exits	= env->query( "exits" );
	string	*obb;

	if ( !target )
		target = offensive_target( me );

	if ( !target || !target->is_character() ||
	     !me->is_fighting( target ) )
		return(notify_fail( "你只能在战斗中使用「随风而舞」。\n" ) );

	if ( (int) me->query_skill( "qiulin-shiye", 1 ) < 90 )
		return(notify_fail( "你目前功力还使不出「随风而舞」。\n" ) );

	if ( me->query( "neili" ) < 500 )
		return(notify_fail( "你的内力不够。\n" ) );

	if ( me->is_busy() )
		return(notify_fail( "你现在正忙着呢。\n" ) );

	me->add( "neili", -200 );
	msg = HIC "$N突然轻嘘一声，身形一展，向随风飘舞而上，身形越来越小。\n"NOR;
	me->start_busy( 1 );

	if ( random( me->query( "combat_exp" ) / 100 ) >
	     target->query( "combat_exp" ) / 400 )
	{
		if ( !target->is_busy() )
			target->start_busy( 4 + random( 4 ) );
		me->receive_damage( "qi", 200 );
		me->receive_damage( "jing", 80 );
		msg += RED "只见$n只看的目瞪口呆,一时手忙脚乱起来，不知如何是好。\n"NOR;
		message_combatd( msg, me, target );
		if ( sizeof(exits) > 0 )
		{
			obb = values( exits );
			me->move( obb[random( sizeof(obb) )] );
		}
	} else{
		msg += HIC "可是$p却暴身南而起，大喝一声：“那里走！”，拦在你的前面，$P这招没有得逞。\n" NOR;
		message_combatd( msg, me, target );
	}
	return(1);
}
