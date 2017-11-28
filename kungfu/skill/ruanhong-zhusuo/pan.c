// panying.c 盘鹰诀

#include <ansi.h>
#include <combat.h>

#define PANYING "「" YEL "盘鹰诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
//      int ap, dp;
//      int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/ruanhong-zhusuo/panying"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(PANYING "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，无法施展" PANYING "。\n");

        if ((int)me->query_skill("ruanhong-zhusuo", 1) < 80)
                return notify_fail("你的软红蛛索不够娴熟，无法施展" PANYING "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");

        if (me->query("neili") < 100)
                return notify_fail("你的真气不够，无法施展" PANYING "。\n");

        if (me->query_skill_mapped("whip") != "ruanhong-zhusuo")
                return notify_fail("你没有激发软红蛛索，无法施展" PANYING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = YEL "$N" YEL "使出软红蛛索「盘鹰」诀，手腕轻轻一抖，顿时鞭"
              "影重重，完全笼罩$n" YEL "四周！\n";

        me->start_busy(1);

        if (random(me->query("combat_exp")) > (int)target->query("combat_exp") / 2)
        {
                msg += HIR "$n" HIR "微作诧异，一时勘破不透$N" HIR "招中"
                       "奥妙，顿被攻了个措手不及！\n" NOR;
                target->start_busy((int)me->query_skill("ruanhong-zhusuo") / 20 + 2);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，小心应对，并没有上当。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}