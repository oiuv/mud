// feilong.c 华山剑法「天外飞龙」

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define LONG "「" HIY "天外飞龙" NOR "」"

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/huashan-jian/long"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LONG "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对！\n");

        if ((int)me->query_skill("huashan-jian", 1) < 150)
                return notify_fail("你华山剑法不够娴熟，无法施展" LONG "。\n");

        if ((int)me->query_skill("force") < 150 )
                return notify_fail("你内功火候不够，无法施展" LONG "。\n");

        if ((int)me->query("neili") < 220)
                return notify_fail("你现在真气不够，无法施展" LONG "！\n");

        if (me->query_skill_mapped("sword") != "huashan-jian")
                return notify_fail("你没有激发华山剑法，无法施展" LONG "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "心念电闪，一提内力，勒手仗剑，运劲于臂，呼"
              "的一声向$n" HIC "掷了出去，\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("dodge");
        if (ap > dp / 2 * 3 && ap / 2 + random(ap) > dp)
        {
                me->start_busy(3);
                damage = target->query("max_qi") / 4 + ap;
                damage += random(damage / 4);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 55,
                                           HIR "$n" HIR "疾忙跃起，但剑如电闪，只觉一阵剧痛，剑刃"
                                           "拦腰而过，鲜血飞溅，皮肉卷起！\n" NOR);
                me->add("neili", -200);
        } else
        {
                me->start_busy(3);
                msg += CYN "然而$n" CYN "轻轻一笑，侧身伸指，正弹"
                       "在$N" CYN "的剑脊上，剑斜飞落地。\n" NOR;
                me->add("neili", -120);
        }

        weapon->move(environment(me));
        message_combatd(msg, me, target);
        return 1;
}
