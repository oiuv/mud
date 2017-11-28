// burning.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        int count;

        if (me->query_temp("burning_up"))
                return notify_fail("你现在正在怒火中，没有必要再发作一次。\n");

        if (me->query_craze() < 1000)
                return notify_fail("你现在还不够愤怒，无法让自己怒火燃烧。\n");

        message_vision(HIR "$N" HIR "一声大吼，两目登时精光"
                       "四射，咄咄逼人，势不可挡。\n" NOR, me);

        me->cost_craze(500 + random(300));
        count = me->query_skill("force") / 5;
        me->set_temp("burning_up", count);
        me->add_temp("apply/attack", count);
        me->apply_condition("burning", 1);

	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: burning|fenu
 
这个指令让你将现在将积蓄的愤怒发泄出来，这样可以充分的提升你
的攻击能力。在发泄时会不断的消耗你的愤怒，直到心情平静的时候
才自动恢复。

HELP
        );
        return 1;
}
