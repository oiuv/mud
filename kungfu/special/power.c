// power.c 天神降世
// Created by Doing Lu 10/7/2K

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIY "天神降世" NOR; }

int perform(object me, string skill)
{
        int count;

        if (me->query("qi") < 80)
                return notify_fail("你的体力不支，无法迅猛提升自己的战斗力。\n");

        message_vision(HIY "$N" HIY "双臂一伸一缩，膝部微弯，"
                       "作势欲扑。\n" NOR, me);
        count = me->query_str();

        if (me->query_temp("special_skill/power", 1))
                return notify_fail("你已经尽力提升自己的战斗力了。\n");

        me->receive_damage("qi", 40 + random(40));
        me->set_temp("special_skill/power", 1);
        me->add_temp("apply/attack", count);
   	me->start_call_out((: call_other, __FILE__, "remove_effect", me,
			      count :), 60 + random(30));

        return 1;
}

void remove_effect(object me, int count)
{
        me->delete_temp("special_skill/power", 1);
        me->add_temp("apply/attack", -count);
        tell_object(me, "你施展完天神降世，松了一口气。\n");
}
