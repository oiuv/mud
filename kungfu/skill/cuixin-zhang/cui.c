#include <ansi.h>
#include <combat.h>
 
inherit F_SSERVER;

#define CUI "「" HIW "夺命催心" NOR "」"
string final(object me, object target, int count);
void cuixin_end(object me, object target, int count);

int perform(object me)
{
        string msg;
        object /*weapon,*/ target;
        int ap, dp;
        int damage, lvl, count; 

        if (playerp(me) && ! me->query("can_perform/cuixin-zhang/cui"))
                return notify_fail("你使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(CUI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon"))
                return notify_fail("你必须是空手才能使用！\n");
 
        lvl = me->query_skill("cuixin-zhang", 1);

        if (lvl < 120)
                return notify_fail("你的催心掌还不够纯熟，无法施展" CUI "\n");

        if (me->query_skill("force") < 120)
                return notify_fail("你的内功火候太低，无法使出" CUI "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你的内力不够，无法使出" CUI "。\n");
 
        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");
		   
		if (target->query_temp("cuixin"))
                return notify_fail("对方已经招架涣散，放胆攻击吧。\n");

        msg = HIR "$N" HIR "聚气于掌，仰天一声狂啸，刹那间双掌交错，一招"
                  "「夺命催心」带着阴毒内劲直贯$n" HIR "！\n"NOR;

        
		ap = me->query_skill("strike") + me->query_skill("force");
        dp = target->query_skill("parry") + target->query_skill("force");
		count = lvl / 8;

        if (dp < 1) dp = 1;

        if ( ap * 11 / 20 + random(ap) > dp)
        {
                msg += HIR "只听$n" HIR "惨叫一声，只感两耳轰鸣，目不视物，软软瘫倒。\n" NOR;
                target->affect_by("cuixin_zhang",
                        ([ "level" : me->query("jiali") + random(me->query("jiali")),
                           "id"    : me->query("id"),
                           "duration" : lvl / 50 + random(lvl / 20) ]));

				damage = ap / 2 + random(ap);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, random(15) + 40,
                                          (: final, me, target, count :));
				
				me->add("neili", -260);
                me->start_busy(2);
        }
        else
        {
				
				msg += HIY "$p见$P来势汹涌，踉踉跄跄的躲开了这致命的一击！\n" NOR;
				me->add("neili", -120);
				me->start_busy(3);
        }
        message_combatd(msg, me, target);
		
		

        return 1;
}

string final(object me, object target, int count)
{
        target->set_temp("cuixin", 1);
		target->add_temp("apply/parry", -count);
        call_out("cuixin_end", 5 + random(count / 5), me, target, count);
}

void cuixin_end(object me, object target, int count)
{
        if (target && target->query_temp("cuixin"))
        {
                if (living(target))
                {
                        message_combatd(HIC "$N" HIC "的视力和听力逐渐恢复了知觉。\n" NOR, target);
						tell_object(target, HIY "你感到被扰乱的真气慢慢平静了下来。\n" NOR);
                }
				target->delete_temp("cuixin");
				target->add_temp("apply/parry", count);
		}
	return;
}