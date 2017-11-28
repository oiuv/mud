#include <ansi.h>
#include <combat.h>

#define XIAN "「" HIY "佛光初现" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/emei-jian/xian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，无法施展" XIAN "。\n");

        if ((int)me->query_skill("emei-jian", 1) < 60)
                return notify_fail("你的峨嵋剑法不够娴熟，无法施展" XIAN "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你现在真气不够，无法施展" XIAN "。\n");

        if (me->query_skill_mapped("sword") != "emei-jian") 
                return notify_fail("你没有激发峨嵋剑法，无法施展" XIAN "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "跨步上前，手中" + weapon->name() +
              HIY "将峨眉剑法运转如飞，剑光霍霍径直逼向$n"
              HIY "。\n" NOR;

        me->add("neili", -75);
        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           (: final, me, target, damage :));
        } else
        {
                msg += HIC "可$n" HIC "却是镇定逾恒，一丝不乱，"
                       "全神将此招化解开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        return  HIR "顿时只听“嗤”的一声，$n" HIR "稍个不慎，"
                "被这一剑划得鲜血淋漓。\n" NOR;
}

