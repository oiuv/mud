#include <ansi.h>
#include <combat.h>

#define CANG "「" HIW "天蝎藏针" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int skill, i;

        if (userp(me) && ! me->query("can_perform/jifeng-cixuefa/cang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(CANG "只能对战斗中的对手使用。\n");

        weapon = me->query_temp("weapon");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所使用的武器不对，难以施展" CANG "。\n");

        skill = me->query_skill("jifeng-cixuefa", 1);

        if (me->query_skill("force") < 120)
                return notify_fail("你的内功修为不够，难以施展" CANG "。\n");

        if (me->query_skill("dodge") < 120)
                return notify_fail("你的轻功修为不够，难以施展" CANG "。\n");

        if (skill < 100)
                return notify_fail("你的疾风刺穴法修为有限，难以施展" CANG "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" CANG "。\n");

        if (me->query_skill_mapped("dagger") != "jifeng-cixuefa")
                return notify_fail("你没有激发疾风刺穴法，难以施展" CANG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "一声叱喝，手中" + weapon->name() + HIY "连环五刺，招数"
              "层出不穷，闪电般朝$n" HIY "射去！\n" NOR;
        message_combatd(msg, me, target);
        me->add("neili", -80);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1 + random(4));
        return 1;
}
