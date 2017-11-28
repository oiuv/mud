#include <ansi.h>
#include <combat.h>

#define CANG "「" HIY "掌藏龙" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object anqi;
        int damage;
        string msg;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/huilong-bifa/cang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(CANG "只能在战斗中对对手使用。\n");

        if (! objectp(anqi = me->query_temp("handing")) ||
            (string)anqi->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if ((int)me->query_skill("huilong-bifa", 1) < 120)
                return notify_fail("你的回龙璧法不够娴熟，难以施展" CANG "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" CANG "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你内力不够了。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "一声轻喝，单手一扬，袖底顿时迸出一股气劲，袖中" +
              anqi->query("name") + NOR + HIY "便如蛟龙般射向$n" HIY "！\n"
              NOR;

        ap = me->query_skill("force") + me->query_skill("throwing");
        dp = target->query_skill("dodge") + target->query_skill("parry");
        me->start_busy(3);

        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -100);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 40,
                                           HIR "$n" HIR "只觉劲风袭体，低头间，发"
                                           "现" + anqi->query("name") + NOR + HIR
                                           "正端端插在自己胸口，顿时惊怒交集，呕"
                                           "出一口鲜血。\n" NOR);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，飞"
                       "身一跃而起，躲避开来。\n" NOR;
        }

        if (anqi->query("id") == "huilong bi")
        {
                msg += HIC "霎时却见回龙璧凌空一个盘旋，又飞回到$N"
                       HIC "手中。\n" NOR;
        }
        message_combatd(msg, me, target);

        if (objectp(anqi) && anqi->query("id") != "huilong bi")
                destruct(anqi);

        return 1;
}
