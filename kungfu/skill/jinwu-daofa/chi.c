#include <ansi.h>
#include <combat.h>

#define CHI "「" HIY "赤焰暴长" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object weapon, weapon2;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/jinwu-daofa/chi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，无法施展" CHI "。\n");

        if ((int)me->query_skill("jinwu-daofa", 1) < 120)
                return notify_fail("你的金乌刀法不够娴熟，无法施展" CHI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在真气不够，无法施展" CHI "。\n");

        if (me->query_skill_mapped("blade") != "jinwu-daofa") 
                return notify_fail("你没有激发金乌刀法，无法施展" CHI "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "凝神聚气，将全身之力注入" + weapon->name() +
              HIY "刀身顺势劈下，顿时一股凌厉的刀芒直贯$n" HIY "而去。\n"
              NOR;

        me->add("neili", -150);
        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (objectp(weapon2 = target->query_temp("weapon"))
           && (string)weapon2->query("skill_type") == "sword"
           && target->query_skill_mapped("sword") == "xueshan-jian")
	{
                msg += HIY "$n" HIY "慌忙中忙以雪山剑法作出抵挡，哪知$N"
                       HIY "刀法竟似雪山剑法克星般，" + weapon->name() +
                       HIY "焰芒霎时\n又暴涨数倍，完全封锁$n" HIY "的所"
                       "有剑招！\n" NOR;
		ap += ap / 2;
	}

        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 40,
                                           (: final, me, target, damage :));
        } else
        {
                msg += HIC "可$n" HIC "却是镇定逾恒，一丝不乱，"
                       "全神将此招化解开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        return  HIR "只听$n" HIR "一声惨叫，被这一刀劈个正中，伤口"
                "深可见骨，鲜血四处飞溅。\n" NOR;
}

