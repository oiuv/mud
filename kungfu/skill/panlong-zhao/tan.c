#include <ansi.h>
#include <combat.h>

#define TAN "「" HIW "云中探爪" NOR "」"
 
inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/panlong-zhao/tan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(TAN "只能在战斗中对对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" TAN "。\n");

        skill = me->query_skill("panlong-zhao", 1);

        if (skill < 130)
                return notify_fail("你的越空盘龙爪等级不够，难以施展" TAN "。\n");
 
        if (me->query_skill_mapped("claw") != "panlong-zhao") 
                return notify_fail("你没有激发越空盘龙爪，难以施展" TAN "。\n");

        if (me->query_skill_prepared("claw") != "panlong-zhao") 
                return notify_fail("你没有准备越空盘龙爪，难以施展" TAN "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" TAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "伸出两掌，朝$n" HIW "拍去，待掌至中途，却变掌为爪，幻作两"
              "道金光袭向$n" HIW "各处要脉！\n" NOR;
 
        ap = me->query_skill("claw");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -150);
                damage = 60 + ap / 3 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45,
                                           HIR "$p" HIR "面对$P" HIR "这电光火石般"
                                           "的双抓，更本无从招架，登时被抓得血肉飞"
                                           "溅！\n" NOR);
                me->start_busy(1);
        } else
        {
                msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的招式，巧妙的招架开来，没露半点破绽！\n" NOR;
                me->add("neili",-50);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
