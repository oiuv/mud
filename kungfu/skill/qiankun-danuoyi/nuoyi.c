// nuoyi.c 大挪移

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
        int level;
        int i;

        me->clean_up_enemy();
	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("「大挪移」只能对战斗中的对手使用。\n");

	if ((level = (int)me->query_skill("qiankun-danuoyi", 1)) < 50)
		return notify_fail("你的乾坤大挪移还没有修炼到第二层，无法施展大挪移。\n");

        if (me->query("neili") < 400)
                return notify_fail("你现在真气不够，无法使用「大挪移」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIM "$N" HIM "招数忽然的一变，摹可明方，内力四处回旋，无形中牵引着$n"
              HIM "的招式！\n";

        ap = level + me->query_skill("force") * 2 / 3;
        dp = target->query_skill("force") * 2 / 3 +
             target->query_skill("dodge", 1);
        if (level >= 300)
        {
                // layer 7 force
                ap += level;
        }

        if (ultrap(target))
                dp += target->query_skill("matrial-cognize", 1);

        der = 0;
        me->start_busy(2);
        me->add("neili", -350);
        if (ap / 3 + random(ap / 3) > dp)
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
