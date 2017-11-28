// ill_shanghan.c

#include <ansi.h>
#include <condition.h>

inherit ILLNESS;

string name() { return "ill_shanghan"; }

int min_qi_needed() { return 20; }

int update_condition(object me, int duration)
{
        if( duration < 1 ) return 0;

        message("vision", HIG + me->name() + "冷不丁打了个冷战，头"
		          "昏沉沉的，好象是得伤寒病了。\n" NOR,
                environment(me), me);

        if( !living(me) && me->query("qi") < 3 ) {
                me->set_temp("die_reason", "伤寒发作，不治身亡了");
                me->die();
                return 0;
        }
        else
                tell_object(me, HIB "你打了个冷战，头昏沉沉的，好象是得伤寒病了！\n" NOR );

        me->receive_wound("qi", 3);
        me->receive_damage("qi", 3);
        me->apply_condition(name(), duration - 1);

        if( duration < 1 ) return 0;
        return CND_CONTINUE;
}
