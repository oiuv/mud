// berserk.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        int max;
        int pts;

        if ((max = me->query_max_craze()) < 1)
                return notify_fail("你的性格不合，不善发作。\n");

        if (me->query_con() < 35 && me->query_str() < 35)
                return notify_fail("你的身体素质还不够好，贸然发作有伤身体。\n");

        if (me->query("neili") < 1000)
                return notify_fail("你的内力不够充沛，难以控制自己的情绪。\n");

        message_vision(HIR "$N" HIR "嘿然冷笑，关节喀啦喀啦"
                       "的响个不停，一股悍气油然而起。\n" NOR, me);

        pts = max * random(me->query_skill("force") + 500) / 1000;
        me->improve_craze(pts);
        pts = pts * 10 / me->query_con();
        me->receive_damage("qi", pts);

	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: berserk|baofa
 
这个指令让你运用内功控制情绪，大行发作，积蓄自己的愤怒。不过
生气对自己没有好处，每次发作都会让自己的气受到损失。在身体不
支的时候发怒小心晕厥。

HELP
        );
        return 1;
}
