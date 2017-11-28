// bandaged.c

#include <condition.h>

inherit F_CLEAN_UP;

int dispel() { return 0; }

int update_condition(object me, int duration)
{
	if( (int)me->query("eff_qi") < (int)me->query("max_qi") )
		me->receive_curing("qi", 3);
	
	me->apply_condition("bandaged", duration - 1);
	if( !duration ) return 0;

	return CND_CONTINUE;
}
