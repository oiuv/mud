#include <ansi.h>
#include <combat.h>

#define JING "「" HIM "惊虹一笔" NOR "」"

inherit F_SSERVER;
 
int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/canghong-bifa/jing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(JING "只能对战斗中的对手使用。\n");

        weapon = me->query_temp("weapon");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所使用的武器不对，难以施展" JING "。\n");

        skill = me->query_skill("canghong-bifa", 1);

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功修为不够，难以施展" JING "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" JING "。\n");

        if (skill < 100)
                return notify_fail("你苍虹笔法修为有限，难以施展" JING "。\n");

        if (me->query_skill_mapped("dagger") != "canghong-bifa")
                return notify_fail("你没有激发苍虹笔法，难以施展" JING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIM "$N" HIM "手中" + weapon->name() + HIM "大开大合，宛若天马行"
              "空，难测阴阳，化作一道道疾光射向$n" HIM "！\n" NOR;
 
        ap = me->query_skill("dagger");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -200);
                damage = 100 + ap / 3 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "顿时只听得“噗嗤”一声，$n" HIR
                                           "胸口被$N" HIR "一笔刺中，溅出一柱鲜血。\n" NOR);
                me->start_busy(1);
                if (ap / 3 + random(ap) > dp && ! target->is_busy())
                        target->start_busy(ap / 25 + 1);
        } else
        {
                msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的招式，巧妙的一一拆解，没露半点"
                       "破绽！\n" NOR;
                me->add("neili", -50);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
