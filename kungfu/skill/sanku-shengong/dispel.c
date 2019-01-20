/* dispel.c */

#include <ansi.h>

int exert( object me, object target )
{
	// int	i;
	string	force_name;
	mapping conditions;

	if ( me->query( "neili" ) < 300 )
	{
		write( "你的内力不足，无法运满一个周天。\n" );
		return(1);
	}

	force_name = to_chinese( me->query_skill_mapped( "force" ) );

	if ( me == target )
	{
		message_vision( HIW "$N" HIW "深吸一口气，又缓缓的吐了出来。\n" NOR, me );
		tell_object( me, YEL "你默运" + force_name +
			     "，开始排除身体中的异常症状。\n" NOR );
		me->add( "neili", -100 );
	} else{
		message_vision( HIW "$N" HIW "深吸一口气，将手掌粘到$n"
				HIW "的背后。\n" NOR,
				me, target );
		tell_object( me, YEL "你默运" + force_name + "，开始帮助" +
			     target->name() + "排除身体中的异常症状。\n" NOR );
		tell_object( target, YEL + me->name() +
			     "正在运功帮助你排除身体中的异常症状。\n" NOR );
		me->add( "neili", -250 );
	}

	conditions = target->query_condition();
	if ( conditions )
	{
		target->clear_condition();

		tell_object( target, YEL + me->name() + "正在运功将你身体中的异常症状尽数排除。\n" NOR );
		if ( me == target )
		{
			tell_object( me, WHT "你调息完毕，将内力收回丹"
				     "田。\n" NOR );
			me->start_busy( 1 + random( 2 ) );
		} else{
			tell_object( me, WHT "你调息完毕，将内力收回"
				     "丹田。\n" NOR );
			tell_object( target, WHT "你觉得内息一畅，看来是" +
				     me->name() + "收功了。\n" );
			me->start_busy( 2 + random( 3 ) );
			if ( !target->is_busy() )
				target->start_busy( 1 + random( 2 ) );
			message_vision( WHT "$N将手掌从$n背后收了回"
					"来。\n" NOR, me, target );
		}
	}

	return(1);
}
