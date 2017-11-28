#include <ansi.h>
#include <combat.h>

#define QIAN "「" HIY "乾坤一击" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/jinyuan-gun/qian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对，难以施展" QIAN "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功的修为不够，难以施展" QIAN "。\n");

        if (me->query_skill("jinyuan-gun", 1) < 120)
                return notify_fail("你的金猿棍法修为不够，难以施展" QIAN "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" QIAN "。\n");

        if (me->query_skill_mapped("club") != "jinyuan-gun")
                return notify_fail("你没有激发金猿棍法，难以施展" QIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "大步上前，怒吼一声，手中" + weapon->name() +
              HIY "急速舞动，霎时间飞沙走石，罡气激荡。\n便在狂沙飓风中"
              "，$N" HIY "忽然高高跃起，迎头一棒朝$n" HIY "劈落！\n" NOR;

        ap = me->query_skill("club");
        dp = target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap * 2 / 3);
                me->add("neili", -150);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 35,
                                           HIR "$n" HIR "浑身被劲风笼罩，登感窒息"
                                           "，“哇”的吐出一口鲜血，仰面便倒！\n" NOR);
        } else
        {
                me->add("neili", -100);
                me->start_busy(3);
                msg += CYN "$n" CYN "不敢有丝毫大意，急忙纵身后跃，躲"
                       "开这足以断金裂石的一击。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
