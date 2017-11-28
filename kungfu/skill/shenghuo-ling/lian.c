#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIW "敛心令" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/shenghuo-ling/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        skill = me->query_skill("shenghuo-ling", 1);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的兵器不对，不能使用圣火令法之" LIAN "。\n");

        if (skill < 150)
                return notify_fail("你的圣火令法等级不够, 不能使用圣火令法之" LIAN "。\n");

        if (me->query("max_neili") < 1600 )
                return notify_fail("你的内力修为不足，不能使用圣火令法之" LIAN "。\n");

        if (me->query("neili") < 350 )
                return notify_fail("你的内力不够，不能使用圣火令法之" LIAN "。\n");

        if (me->query_skill_mapped("sword") != "shenghuo-ling") 
                return notify_fail("你没有激发圣火令法，不能使用圣火令法之" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "一个筋斗猛翻至$n" HIW "跟前，陡然使出圣火"
              "令法之敛心令，手中" + weapon->name() + NOR + HIW "忽伸"
              "忽缩，招式诡异无比。\n" NOR;

        damage = skill / 2 + random(skill);
        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -300);
                me->start_busy(3);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK,                
                       damage, 0, (: final, me, target, damage :));
                       
        }
        else
        {
                me->add("neili", -100);
                msg += CYN "$n" CYN "见眼前寒光颤动，连忙振作精神勉强"
                      "抵挡，向后疾退数步，好不容易闪在了$N" CYN "攻"
                      "击范围之外。\n" NOR;
                me->start_busy(4);
        }
        message_combatd(msg, me, target);
        return 1;
}

string final(object me, object target, int damage)
{

       target->receive_damage("jing", damage / 2);
       target->receive_wound("jing", damage / 4);
       target->start_busy(1);

       return HIR "$n" HIR "只见眼前寒光颤动，突"
              "然$N" HIR "双手出现在自己眼前，两处太阳穴顿"
              "时一阵剧痛。\n" NOR;
}
