/* tangmen-throwing.c 唐门暗器 */

#include <ansi.h>

inherit SKILL;

int valid_enable( string usage )
{
	return(usage == "throwing");
}

int valid_learn( object me )
{
	if ( (int) me->query_skill( "force", 1 ) < 60 )
		return(notify_fail( "你的内功心法火候不够，无法学唐门暗器。\n" ) );

	if ( (int) me->query_skill( "dodge", 1 ) < 60 )
		return(notify_fail( "你的轻功火候不够，无法领悟唐门暗器。\n" ) );

	if ( me->query_skill( "throwing", 1 ) < 50 )
		return(notify_fail( "你的暗器技能不够娴熟，无法领悟唐门暗器。\n" ) );

	if ( me->query("dex") < 30 )
		return(notify_fail( "你的身法不够灵巧，无法学习唐门暗器。\n" ) );

	if ( me->query_str() < 30 )
		return(notify_fail( "你的臂力不够，多练练本门的基本手法吧。\n" ) );

	if ( me->query("int") < 28 )
		return(notify_fail( "你的悟性不够，无法领悟唐门暗器秘诀。\n" ) );

	if ( (int) me->query_skill( "throwing", 1 ) < (int) me->query_skill( "tangmen-throwing", 1 ) )
		return(notify_fail( "你的基本暗器水平有限，难以领会更高深的唐门暗器。\n" ) );

	return(1);
}

int practice_skill( object me )
{
	// object weapon;

	if ( (int) me->query( "qi" ) < 60 )
		return(notify_fail( "你的体力太低了。\n" ) );

	if ( (int) me->query( "neili" ) < 60 )
		return(notify_fail( "你的内力不够练唐门暗器。\n" ) );

	me->receive_damage( "qi", 50 );
	me->add( "neili", -50 );
	return(1);
}

string perform_action_file( string action )
{
	return(__DIR__ "tangmen-throwing/" + action);
}
