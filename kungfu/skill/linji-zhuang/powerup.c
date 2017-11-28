// powerup.c

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount, int di);

int exert(object me, object target)
{
        int skill;
        int di;
        object weapon;

        if (target != me)
                return notify_fail("你只能用临济庄提升自己的战斗力。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");

        me->add("neili", -100);
        me->receive_damage("qi", 0);

        if (me->query("sex")) di = 0; else di = skill / 2;
        if (di > 100) di = 100;

        message_combatd(MAG "$N" MAG "微一凝神，运起临济庄，一声娇喝，"
                        "四周的空气仿佛都凝固了！\n" NOR, me);

        if (objectp(weapon = me->query_temp("weapon")))
        {
                if (di >= 95)
                        message_combatd(HIR "$N" HIR "脸色一沉，运起临济庄神通，霎时间" +
                                        weapon->name() + HIR "光华四射，漫起无边杀意。\n" NOR, me);
                else
                if (di >= 80)
                        message_combatd(HIR "$N" HIR "潜运内力，只见" +
                                        weapon->name() + HIR "闪过一道光华，气势摄人，令人肃穆。\n" NOR, me);
                else
                if (di >= 30)
                        message_combatd(HIR "$N" HIR "默运内力，就见那" +
                                        weapon->name() + HIR "隐隐透出一股光芒，闪烁不定。\n" NOR, me);
        }

        me->add_temp("apply/attack", skill / 3);
        me->add_temp("apply/dodge", skill / 3);
        me->add_temp("apply/damage", di);
        me->set_temp("powerup", 1);
        me->start_call_out((: call_other,__FILE__, "remove_effect", me, skill / 3, di :), skill);

        if (me->is_fighting()) me->start_busy(3);

        return 1;
}

void remove_effect(object me, int amount, int di)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/dodge", -amount);
                me->add_temp("apply/damage", -di);
                me->delete_temp("powerup");
                tell_object(me, "你的临济庄运行完毕，将内力收回丹田。\n");
        }
}
