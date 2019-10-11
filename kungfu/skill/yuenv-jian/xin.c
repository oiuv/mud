// pengxin.c 西子捧心

#include <ansi.h>
#include <combat.h>

#define XIN "「" HIM "西子捧心" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp;
        int damage;
        int delta;
		
		float improve;
		int lvl, m, n;
		string martial;
		string *ks;
		martial = "sword";
 
        if (userp(me) && ! me->query("can_perform/yuenv-jian/xin"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
	        return notify_fail(XIN "只能在战斗中对对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
	        return notify_fail("你使用的武器不对。\n");

	if (me->query_skill("sword", 1) < 200)
		return notify_fail("你的剑术修为不够，不能施展" XIN "！\n");

	if (me->query_skill("yuenv-jian", 1) < 150)
		return notify_fail("你的越女剑术的修为不够，不能施展" XIN "！\n");

	if (me->query_skill("dodge",1) < 150)
		return notify_fail("你的轻功修为不够，不能施展" XIN "！\n");

	if (me->query("neili") < 200)
		return notify_fail("你的真气不够！\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        if (me->query("gender") == "女性" &&
            target->query("gender") == "女性")
                delta = target->query("per") - me->query("per");
        else
                delta = 0;

	msg = HIG "\n$N" HIG "幽幽一声长叹，手中的" + weapon->name() +
              HIG "就如闪电般刺向$n" HIG "的胸口。\n但见剑招轻盈灵动，优美华丽，就"
              "连杀人间也不带一丝尘俗之气。\n" NOR;

        if (delta > 0)
                msg += HIY "$n" HIY "只觉得$N" HIY "眼神中隐然透出"
                       "一股冰冷的寒意，心中不禁一颤。\n" NOR;
        else
                delta = 0;
			
		lvl = to_int(pow(to_float(me->query("combat_exp") * 10), 1.0 / 3));
		lvl = lvl * 4 / 5;
		ks = keys(me->query_skills(martial));
		improve = 0;
		n = 0;
		//最多给予5个技能的加成
		for (m = 0; m < sizeof(ks); m++)
		{
			if (SKILL_D(ks[m])->valid_enable(martial))
			{
				n += 1;
				improve += (int)me->query_skill(ks[m], 1);
				if (n > 4 )
					break;
			}
		}
		
		improve = improve * 5 / 100 / lvl;

		me->add("neili", -180);
        ap = (me->query_skill("sword") + me->query_skill("dodge")) / 2;
        dp = target->query_skill("dodge");
		ap += ap * improve;
        me->start_busy(1);
        if (ap * 7 / 10  + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2) + delta * 20;

                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "大吃一惊，慌忙躲避，然而剑"
                                           "气来的好快，哪里躲得开？\n只听$p" HIR
                                           "一声惨叫，胸口已经被剑气所伤！\n" NOR);
                if (ap / 2 + random(ap) > dp)
                {
                        //damage /= 3;
                        damage = ap + random(ap / 2) + delta * 20;
                        
                        msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                                   HIC "$n重创之下不禁破绽迭出，$P"
                                                   HIC "见状随手刺出" + weapon->name() +
                                                   HIC "，又是一剑！\n" HIR "就听$p"
                                                   HIR "又是一声惨叫，痛苦不堪。\n" NOR);
                }
        } else
        {
                msg += HIC "$n" HIC "见状身形急退，避开了$N"
                       HIC "的无形剑气的凌厉一击！\n" NOR;
        }

        message_combatd(msg, me, target);

	return 1;
}
