#include <ansi.h>
#include <combat.h>

#define KONG "「" HIY "无孔不入" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        object weapon;

        if (userp(me) && ! me->query("can_perform/sanwu-shou/kong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(KONG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "whip")
                return notify_fail("你所使用的武器不对，难以施展" KONG "。\n");

        if ((int)me->query_skill("sanwu-shou", 1) < 140)
                return notify_fail("你三无三不手够娴熟，难以施展" KONG "。\n");

        if (me->query_skill_mapped("whip") != "sanwu-shou")
                return notify_fail("你没有激发三无三不手，难以施展" KONG "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" KONG "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" KONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("whip");
        dp = target->query_skill("parry");

        msg = HIY "\n$N" HIY "一声长啸，内劲暴涨，施出绝招「" HIW "无孔"
              "不入" HIY "」手中" + weapon->name() + HIY "哧哧作响，龙"
              "吟不定，$N" HIY "猛然腾空而起，挥舞着手中的" + weapon->name() + 
              HIY "，凌空直下，涌向$n" HIY "。\n" NOR;
        message_sort(msg, me, target); 

        if (ap / 2 + random(ap) > dp)
        {
                damage = (int)me->query_skill("sanwu-shou", 1);
                damage += random(damage / 2);

                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "但见$N" HIR "攻势如洪，气势磅礴，"
                                           "$n" HIR "心中略微一惊，惨叫一声，顿"
                                           "时鲜血淋淋。\n" NOR);

                me->start_busy(2 + random(3));
                me->add("neili", -220);
        } else
        {
                msg = CYN "$n" CYN "见$N" CYN "这招袭来，内力"
                      "充盈，只得向后一纵，才躲过这一鞭。\n" NOR;

                me->start_busy(4);
                me->add("neili", -100);
        }
        message_vision(msg, me, target);
        return 1;
}
