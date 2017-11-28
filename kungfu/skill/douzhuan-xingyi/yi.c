// yi.c 斗转星移

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
        object *obs;
        object der;
	string msg;
        int ap, dp;
        int damage;
        int i;

        if (userp(me) && ! me->query("can_perform/douzhuan-xingyi/yi"))
                return notify_fail("你还不会使用斗转星移。\n");

        me->clean_up_enemy();
	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("「斗转星移」只能对战斗中的对手使用。\n");

	if ((int)me->query_skill("douzhuan-xingyi", 1) < 100)
		return notify_fail("你的斗转星移不够娴熟，不会使用绝招。\n");

        if ((int)me->query_skill("zihui-xinfa", 1) < 100)
                return notify_fail("你的紫徽心法修为还不到家，"
                                   "难以运用「斗转星移」。\n");

        if (me->query("neili") < 60)
                return notify_fail("你现在真气不够，无法使用「斗转星移」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	weapon = target->query_temp("weapon");
        if (weapon && weapon->query("skill_type") == "pin")
                return notify_fail("对方手里拿的是一根小小的针，"
                                   "你没有办法施展「斗转星移」。\n");

	msg = HIM "$N" HIM "运起紫徽心法，内力自气海穴出，经由"
              "任督二脉奔流而出，巧妙的牵引着$n" HIM "的招式！\n";

        ap = me->query_skill("douzhuan-xingyi", 1) +
             me->query_skill("zihui-xinfa", 1) / 2;
        dp = target->query_skill("force");
        der = 0;
        me->start_busy(2);
        me->add("neili", -50);
        if (ap > dp * 13 / 10)
        {
                // Success to make the target attack hiself
                msg += HIR "结果$p" HIR "一招击出，正好打在自己的"
                       "要害上，不禁一声惨叫，摔跌开去。\n" NOR;
                damage = target->query("max_qi");
                target->receive_damage("qi", damage / 2, me);
                target->receive_wound("qi", damage / 2, me);
        } else
        if (ap / 3 + random(ap) < dp)
        {
                // The enemy has defense
                msg += CYN "然而$p" CYN "内功深厚，并没有被$P"
                       CYN "这巧妙的劲力所带动。\n" CYN;
        } else
        if (sizeof(obs = me->query_enemy() - ({ target })) == 0)
        {
                // No other enemy
                msg += HIC "结果$p" HIC "的招式莫名其妙的变"
                       "了方向，竟然控制不住！幸好身边没有别"
                       "人，没有酿成大祸。\n" NOR;
        } else
        {
                string name;
                // Sucess to make the target attack my enemy
                der = obs[random(sizeof(obs))];
                name = der->name();
                if (name == target->name()) name = "另一个" + name;
                msg += HIG "结果$p" HIG "发出的招式不由自主"
                       "的变了方向，突然攻向" + name + HIG "，不禁令" + 
                       name + HIG "大吃一惊，招架不迭！" NOR;
        }

	message_combatd(msg, me, target);

        if (der)
        {
                // Target attack my enemy
                for (i = 0; i < 2 + random(3); i++)
                {
                        if (! der->is_busy()) der->start_busy(1);
                        COMBAT_D->do_attack(target, der, target->query_temp("weapon"));
                }
        }

	return 1;
}
