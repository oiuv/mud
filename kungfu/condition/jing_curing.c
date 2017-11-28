// jing_curing.c

#include <condition.h>

inherit F_CLEAN_UP;

int dispel() { return 0; }

int update_condition(object me, int duration)
{
        if( (int)me->query("eff_jing") < (int)me->query("max_jing") )
                me->receive_curing("jing", 3);

        me->apply_condition("jing_curing", duration - 1);
        if( !duration ) return 0;

        return CND_CONTINUE;
}
