
#include <ansi.h>
#include <combat.h>

#define HENG "「" HIC "横空出世" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/yinyang-ren/heng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HENG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || ((string)weapon->query("skill_type") != "sword"
           && (string)weapon->query("skill_type") != "blade"))
                return notify_fail("你使用的武器不对，难以施展" HENG "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，难以施展" HENG "。\n");

        if (me->query_skill("yinyang-ren", 1) < 180)
                return notify_fail("你的阴阳刃法修为不够，难以施展" HENG "。\n");

        if ((int)me->query_skill("dodge") < 200)
                return notify_fail("你的轻功火候不够，难以施展" HENG "。\n");  

        if ((int)me->query("max_neili") < 2700)
                return notify_fail("你的内力修为不足，难以施展" HENG "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" HENG "。\n");

        if (me->query_skill_mapped("sword") != "yinyang-ren"
            && me->query_skill_mapped("blade") != "yinyang-ren")
                return notify_fail("你没有激发阴阳刃法，难以施展" HENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "\n只见$N" HIY "手中" + weapon->name() + HIY "斜指"
              "苍天，猛然间招式突变，" + weapon->name() + HIY "“呼"
              "呼”作响，一式「" HIC "横空出世" HIY "」，力劈虚空，"
              "气压群山，犹如风卷残云般地袭向$n" HIY "。\n" NOR;
        message_sort(msg, me, target);

        // 根据所激发的是sword或blade来判断ap值。
        if (me->query_skill_mapped("sword") == "yinyang-ren")
                ap = me->query_skill("sword");
        else 
                ap = me->query_skill("blade");

        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                me->add("neili", -240);
                me->start_busy(2 + random(2));
                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 75,
                                           HIR "$n" HIR "见此招来势凶猛， 阻挡不"
                                           "及， 顿时被" + weapon->name() + HIR 
                                           "所伤，苦不堪言。\n" NOR);
        } else
        {
                me->add("neili", -150);
                me->start_busy(1 + random(2));
                msg = CYN "可却见" CYN "$n" CYN "猛的拔地而起，避开了"
                       CYN "$N" CYN "来势凶猛的一招。\n" NOR;
        }
        message_vision(msg, me, target);

        return 1;
}
