#include <ansi.h>
#include <combat.h>

#define TIAN "「" HIY "天刀八势" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      int damage;
//      string msg;
        object weapon;
        int i, count;

        if (userp(me) && ! me->query("can_perform/bagua-dao/tian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(TIAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你所使用的武器不对，难以施展" TIAN "。\n");

        if ((int)me->query_skill("bagua-dao", 1) < 200)
                return notify_fail("你的八卦刀法不够娴熟，难以施展" TIAN "。\n");

        if ((int)me->query_skill("wai-bagua", 1) < 200)
                return notify_fail("你的外八卦神功不够娴熟，难以施展" TIAN "。\n");

        if ((int)me->query_skill("nei-bagua", 1) < 200)
                return notify_fail("你的内八卦神功不够娴熟，难以施展" TIAN "。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内功修为不足，难以施展" TIAN "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在真气不够，难以施展" TIAN "。\n");

        if (me->query_skill_mapped("blade") != "bagua-dao")
                return notify_fail("你没有激发八卦刀法，难以施展" TIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        message_combatd(HIY "$N" HIY "蓦地一振手中" + weapon->name() +
                        HIY "，发出万千龙吟，霎时刀光滚滚，向四面涌出"
                        "，笼罩$n" HIY "全身。\n" NOR, me, target);

        count = me->query_skill("bagua-dao", 1) / 6;

        me->add("neili", -250);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 8; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);

                me->add_temp("pfm_tiandao", 1);
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->delete_temp("pfm_tiandao");
        me->start_busy(1 + random(8));
        return 1;
}