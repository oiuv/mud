#include <ansi.h>
#include <combat.h>

#define YI "「" HIY "弘意式" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, skill;
        int damage;

        skill = me->query_skill("dugu-jiujian", 1);

        if (me->query("can_learn/dugu-jiujian/nothing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");       

        if (skill < 90)
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(YI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" YI "。\n");

        if (me->query_skill_mapped("sword") != "dugu-jiujian") 
                return notify_fail("你没有激发独孤九剑，难以施展" YI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        switch (random(3))
        {
        case 0:
                msg = HIY "$N" HIY "随手一剑指向$n" HIY "，落点正是$n"
                      HIY "破绽所在，神剑之威，当真人所难测。\n" NOR;
                break;

        case 1:
                msg = HIY "$N" HIY "剑招大开大阖，看似杂乱无章，但招"
                      "招皆击$n" HIY "攻势中破绽，有如神助。\n" NOR;
                break;

        default:
                msg = HIY "$N" HIY "反手横剑刺向$n" HIY "，这似有招似"
                      "无招的一剑竟然威力奇大，令人匪夷所思。\n" NOR;
                break;
        }

        ap = me->query_skill("sword") +
             me->query_skill("martial-cognize",1);

        dp = target->query_skill("parry") +
             target->query_skill("martial-cognize",1) +
             target->query_skill("dugu-jiujian");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "全然无法领会$N" HIR "剑"
                                           "招中的奥妙，一个疏神，登遭重创！\n" NOR);
                me->start_busy(2);
        } else 
        {
                msg += CYN "可$n" CYN "淡然处之，并没将$N"
                       CYN "此招放在心上，随手架开，不漏半点破绽。\n" NOR;
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
