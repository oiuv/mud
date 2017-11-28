#include <ansi.h>
#include <combat.h>

#define QI "「" HIW "破气式" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, skill;
        int damage;

        if (me->query("can_learn/dugu-jiujian/nothing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");       

        if (userp(me) && me->query("can_perform/dugu/qi") < 100)
                return notify_fail("你所使用的外功中没有这种功能。\n");

        me->clean_up_enemy();
        if (! target) target = me->select_opponent();

        skill = me->query_skill("dugu-jiujian", 1);

        if (! me->is_fighting(target))
                return notify_fail(QI "只能对战斗中的对手使用。\n");

        if (skill < 120)
                return notify_fail("你独孤九剑等级不够，无法施展" QI "。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，无法施展" QI "。\n");

        if (me->query_skill_mapped("sword") != "dugu-jiujian") 
                return notify_fail("你没有激发独孤九剑，无法施展" QI "。\n");

        if (target->query_temp("no_exert"))
                return notify_fail("对方现在已经无法控制真气，放胆攻击吧。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "施出独孤九剑「破气式」，手中" + weapon->name() +
              HIW "中攻直进，遥指$n" HIW "的气海要穴。\n" NOR;

        ap = me->query_skill("sword") +
             me->query_skill("parry");

        dp = target->query_skill("force") +
             target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 85,
                                           (: final, me, target, damage :));
                me->start_busy(3);
        } else 
        {
                msg += CYN "可$n" CYN "深知$N" CYN "这招的厉"
                       "害，当即向后横移数尺，躲闪开来。\n" NOR;
                me->start_busy(4);
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int ap)
{
        target->set_temp("no_exert", 1);
        call_out("poqi_end", 10 + random(ap / 30), me, target);
        return  HIR "$n" HIR "被$N" HIR "一剑划过气门，登感一阵"
                "锥心的刺痛，全身真气源源而泻！\n" NOR;
}

void poqi_end(object me, object target)
{
        if (target && target->query_temp("no_exert"))
        {
                if (living(target))
                {
                        message_combatd(HIC "$N" HIC "深深吸入一口气，脸色由"
                                        "白转红，看起来好多了。\n" NOR, target);

                        tell_object(target, HIY "你感到被扰乱的真气慢慢平静"
                                            "了下来。\n" NOR);
                }
                target->delete_temp("no_exert");
        }
        return;
}
