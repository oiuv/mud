#include <ansi.h>
#include <combat.h>

#define FANYIN "「" MAG "域外梵音" NOR "」"

inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp, jing_wound;

        if (userp(me) && ! me->query("can_perform/kunlun-jian/fanyin"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(FANYIN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" FANYIN "。\n");

        if (me->query_skill("tanqin-jifa", 1) < 120)
                return notify_fail("你的弹琴技法尚且不够熟练, 难以施展" FANYIN "。\n");

        if (me->query_skill("kunlun-jian", 1) < 120)
                return notify_fail("你的昆仑剑法等级不够, 难以施展" FANYIN "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" FANYIN "。\n");

        if (me->query("max_neili") < 2000)
                return notify_fail("你的内力修为尚浅，难以施展" FANYIN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" FANYIN "。\n");

        if (me->query_skill_mapped("sword") != "kunlun-jian")
                return notify_fail("你没有激发昆仑剑法，难以施展" FANYIN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = MAG "$N" MAG "微微一笑，左手横握剑柄，右手五"
              "指对准" + weapon->name() + NOR + MAG "剑脊"
              "轻轻弹拨，剑身微颤，声若龙吟。\n顿时发出一"
              "阵清脆的琴音……\n" NOR;

        skill = me->query_skill("kunlun-jian", 1);
        ap = me->query_skill("sword");
        dp = target->query_skill("force");
        if (dp < 1) dp = 1;
        if (random(ap) > dp / 2)
        {
                me->add("neili", -200);
                jing_wound = (int)me->query_skill("sword") +
                             (int)me->query_skill("tanqin-jifa", 1);
                jing_wound = jing_wound / 2 + random(jing_wound / 2);

                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK,
                       jing_wound, 60, MAG "$n" MAG "顿时只觉琴音犹"
                       "如两柄利剑一般刺进双耳，刹那间头晕目眩，全身"
                       "刺痛！\n" NOR);
                me->start_busy(2 + random(2));
        } else
        {
                me->add("neili", -50);
                msg += CYN "可是$n" CYN "赶忙宁心静气，收敛心神，丝"
                       "毫不受$N" CYN "琴音的干扰。\n" NOR;
                me->start_busy(3);
        }
        message_combatd(msg, me, target);
        return 1;
}
