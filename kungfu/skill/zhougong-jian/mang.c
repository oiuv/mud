#include <ansi.h>
#include <combat.h>

#define MANG "「" HIW "剑芒" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, damage;
//      object ob;

        if (userp(me) && ! me->query("can_perform/zhougong-jian/mang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(MANG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" MANG "。\n");

        if ((int)me->query_skill("zhougong-jian", 1) < 140)
                return notify_fail("你的周公剑火候太浅，难以施展" MANG "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功修为太浅，难以施展" MANG "。\n");

        if ((int)me->query("max_neili", 1) < 2200)
                return notify_fail("你的内力修为太浅，难以施展" MANG "。\n");

        if (me->query_skill_mapped("sword") != "zhougong-jian")
                return notify_fail("你没有激发周公剑，难以施展" MANG "。\n");

        if ((int)me->query("neili", 1) < 500)
                return notify_fail("你现在的真气不足，，难以施展" MANG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

	damage = ap / 4 + random(ap / 4);

        msg = HIW "$N" HIW "一声清啸，手中" + weapon->name() + HIW "凌"
                  "空划出，剑尖陡然生出半尺吞吐不定的青芒，一道剑气破空"
                  "径直划向$n。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 65,
                                           HIR "$n" HIR "一声惨叫，凌厉的剑气已划"
                                           "过气门，在身上刺出数个血洞，鲜血如泉"
                                           "水般涌出！\n" NOR);
        } else
        {
                msg += CYN "可是$n" CYN "看破了$N"
                       CYN "的企图，斜跃避开。\n" NOR;
        }

        msg += HIW "\n$N" HIW "见$n" HIW "应接不暇，一声冷笑，兵刃挥洒而"
              "出，一记更加凌厉的剑芒由剑尖弹射而出，凌空直射$n" HIW
              "。\n" NOR;
        if (ap * 2 / 5 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
                                           HIR "只听“噗嗤”一声，剑气正中$n" HIR
                                           "胸口，留下一个碗口大的血洞！$n" HIR
                                           "哀嚎一声，再也无法站起。\n" NOR);
        } else
        {
        	msg += CYN "$n" CYN "强忍全身的痛楚，飞身一跃，避开了$N"
                       CYN "这强大的杀着。\n" NOR;
	}
        me->start_busy(2 + random(3));
        me->add("neili", -400);
        message_combatd(msg, me, target);
        return 1;
}