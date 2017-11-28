
#include <ansi.h>

inherit F_SSERVER;

#define DIAN "「" HIG "隔空点穴" NOR "」"

int perform(object me, object target)
{
        object weapon;
        string msg;
        int time;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/yinsuo-jinling/dian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(DIAN "点穴攻击只能对战斗中的对手使用。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            weapon->query("skill_type") != "whip")
                return notify_fail("你的武器不对，无法施展" DIAN "！\n");

        if (me->query_skill("yinsuo-jinling", 1) < 80)
                return notify_fail("你的银索金铃级别不够，无法施展" DIAN "！\n");

        if (me->query_skill("force") < 100)
                return notify_fail("你的内功修为不够，无法施展" DIAN "！\n");

        if (me->query("neili") < 150)
                return notify_fail("你现在真气不够，无法施展" DIAN "！\n");

        if (me->query_skill_mapped("whip") != "yinsuo-jinling")
                return notify_fail("你没有激发银索金铃，无法施展" DIAN "！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "\n$N" HIY "单手一抖，手中" + weapon->name() +
              HIY "疾颤三下，分点$n" HIY "脸上「迎香」、「承泣"
              "」、「人中」三个穴道，这三下点穴出手之快、认位之"
              "准，实是武林罕见！" NOR;

        me->start_busy(1 + random(2));

        message_sort(msg, me, target);

        if (random(me->query("combat_exp")) > (int)target->query("combat_exp") / 2)
        {
                msg = HIR "$n" HIR "只听$N" + weapon->name() +
                      HIR "发出玎玎声响，声虽不大，却是"
                      "十分怪异，入耳荡心摇魄，一不\n留神"
                      "，被这招点个正着，全身瘫软无力，动"
                      "弹不得！\n" NOR;
                time = (int)me->query_skill("yinsuo-jinling") / 25;
                time = 2 + random(time);
                if (time > 13) time = 13;
                target->start_busy(time);
        } else
        {
                msg = CYN "可是$p" CYN "看破了$P"
                      CYN "的企图，斜跳躲闪开来。\n" NOR;
        }
        me->add("neili", -120);
        message_combatd(msg, me, target);

        return 1;
}
