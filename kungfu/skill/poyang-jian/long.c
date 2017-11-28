
#include <ansi.h>
#include <combat.h>

#define LONG "「" HIC "天外玉龙" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
        int neili, hit_point, time;

        if (userp(me) && ! me->query("can_perform/poyang-jian/long"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LONG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" LONG "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，难以施展" LONG "。\n");

        if (me->query_skill("poyang-jian", 1) < 180)
                return notify_fail("你的破阳冷光剑修为不够，难以施展" LONG "。\n");

        if ((int)me->query_skill("dodge") < 200)
                return notify_fail("你的轻功火候不够，难以施展" LONG "。\n"); 

        if ((int)me->query("max_neili") < 2700)
                return notify_fail("你的内力修为不足，难以施展" LONG "。\n");

        if (me->query("neili") < 350)
                return notify_fail("你的真气不够，难以施展" LONG "。\n");

        if (me->query_skill_mapped("sword") != "poyang-jian")
                return notify_fail("你没有激发破阳冷光剑，难以施展" LONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");
        
        if (! me->query("real_perform/poyang-jian/long"))
        {
                msg = HIY "\n只见$N" HIY "手中" + weapon->name() + HIY
                      "横扫而出，施出绝招「" HIC "天外玉龙" HIY "」，"
                      "剑势纵横，犹如一条长龙蜿蜒而出，刺向$n\n" HIY "。" NOR;
               
                neili = 220;
                hit_point = 55;
                time = 2 + random(2);
        }

        else
        {
                msg = HIW "\n但见$N" HIW "手中" + weapon->name() + HIW 
                      "自半空中横过，剑身似曲似直，便如一件活物一般，正"
                      "是破阳冷光剑的精髓「" HIY "天外玉龙" HIW "」，一"
                      "柄死剑被$N" HIW "使得如灵蛇，如神龙，猛然剑刺向$n\n" 
                      HIW "。" NOR;

                neili = 300;
                hit_point = 80;
                time = 3 + random(4);
        }
        message_sort(msg, me, target);

        ap = me->query_skill("sword");

        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                me->add("neili", -neili);
                me->start_busy(time);
                msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, hit_point,
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
