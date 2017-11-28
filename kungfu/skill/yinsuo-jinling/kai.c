#include <ansi.h>
#include <combat.h>

#define KAI "「" HIY "开天辟地" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        object weapon;

        if (userp(me) && ! me->query("can_perform/yinsuo-jinling/kai"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(KAI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "whip")
                return notify_fail("你所使用的武器不对，难以施展" KAI "。\n");

        if ((int)me->query_skill("yinsuo-jinling", 1) < 140)
                return notify_fail("你银索金铃够娴熟，难以施展" KAI "。\n");

        if (me->query_skill_mapped("whip") != "yinsuo-jinling")
                return notify_fail("你没有激发银索金铃，难以施展" KAI "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" KAI "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" KAI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("whip");
        dp = target->query_skill("parry");

        msg = HIW "\n$N" HIW "长啸一声，疼空而起，施出绝招「" HIY "开天辟地" HIW
              "」，手中" +weapon->name() + HIW "犹如长龙般龙吟不定，临空而下，罩"
              "向$n。" NOR;

        message_sort(msg, me, target);

        if (ap / 2 + random(ap) > dp)
        {
                damage = (int)me->query_skill("yinsuo-jinling", 1);
                damage += random(damage / 2);

                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "\n但见$N" HIR "攻势如洪，气势磅礴，"
                                           "$n" HIR "心中略微一惊，惨叫一声，顿"
                                           "时鲜血淋淋。\n" NOR);

                me->start_busy(2 + random(2));
                me->add("neili", -220);
        } else
        {
                msg = CYN "\n$n" CYN "见$N" CYN "这招袭来，内力"
                      "充盈，只得向后一纵，才躲过这一鞭。\n" NOR;

                me->start_busy(4);
                me->add("neili", -100);
        }
        message_vision(msg, me, target);
        return 1;
}
