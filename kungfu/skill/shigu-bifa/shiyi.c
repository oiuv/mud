#include <ansi.h>
#include <combat.h>

#define SHIYI "「" HIW "诗意纵横" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int skill, i;

        if (userp(me) && ! me->query("can_perform/shigu-bifa/shiyi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(SHIYI "只能对战斗中的对手使用。\n");

        weapon = me->query_temp("weapon");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所使用的武器不对，难以施展" SHIYI "。\n");

        skill = me->query_skill("shigu-bifa", 1);

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功修为不够，难以施展" SHIYI "。\n");

        if (skill < 120)
                return notify_fail("你的石鼓打穴笔法修为有限，难以施展" SHIYI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" SHIYI "。\n");

        if (me->query_skill_mapped("dagger") != "shigu-bifa")
                return notify_fail("你没有激发石鼓打穴笔法，难以施展" SHIYI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "纵步上前，手中" + weapon->name() + HIW "大开大"
              "合，招数连绵不绝，荡气回肠，瞬间向$n" HIW "攻出数招！\n" NOR;
        message_combatd(msg, me, target);
        me->add("neili", -80);

        for (i = 0; i < 4; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1 + random(4));
        return 1;
}
