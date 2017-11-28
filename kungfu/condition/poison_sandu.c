// poison_sandu.c

#include <ansi.h>

int update_condition(object me, int duration)
{
        me->receive_wound("jing", 10);
        me->receive_damage("jing", 10);
        me->receive_wound("qi", 10);
        me->receive_damage("qi", 10);
	me->apply_condition("poison_sandu", duration);
	tell_object(me, HIG "你的体内毒质在反扑自身了！\n" NOR );
	if( duration < 1 ) return 0;
	return 1;
}
