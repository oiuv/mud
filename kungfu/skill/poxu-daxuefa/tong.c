#include <ansi.h>
#include <combat.h>

#define TONG "「" HIR "破元通虚" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

string *finger_name = ({ "左手中指", "左手无名指", "左手食指",
                         "右手中指", "右手无名指", "右手食指", }); 

int perform(object me, object target)
{
        object weapon;
        string wp, msg;
        int ap, dp, skill;
        int damage;

        if (userp(me) && ! me->query("can_perform/poxu-daxuefa/tong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        me->clean_up_enemy();
        if (! target) target = me->select_opponent();

        skill = me->query_skill("poxu-daxuefa", 1);

        if (! me->is_fighting(target))
                return notify_fail(TONG "只能对战斗中的对手使用。\n");

        if (skill < 120)
                return notify_fail("你破虚打穴法等级不够，无法施展" TONG "。\n");

        weapon = me->query_temp("weapon");

        if (weapon && weapon->query("skill_type") != "dagger")
                return notify_fail("你所使用的武器不对，无法施展" TONG "。\n");

        if (weapon && me->query_skill_mapped("dagger") != "poxu-daxuefa")
                return notify_fail("你没有激发破虚打穴法，无法施展" TONG "。\n");

        if (! weapon && me->query_skill_prepared("finger") != "poxu-daxuefa")
                return notify_fail("你没有准备破虚打穴法，无法施展" TONG "。\n");

        if (target->query_temp("no_exert"))
                return notify_fail("对方现在已经无法控制真气，放胆攻击吧。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，无法施展" TONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        if (weapon)
                wp = "手中" + weapon->name();
        else
                wp = finger_name[random(sizeof(finger_name))];

        msg = HIG "$N" HIG "翻转" + wp + HIG "，接连变化数种打穴手法，一式「"
              HIR "破元通虚" HIG "」直捣$n" HIG "胸前要穴。\n" NOR;

        ap = me->query_skill("poxu-daxuefa", 1);
        dp = target->query_skill("force", 1);

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 50,
                                           (: final, me, target, damage :));
                me->add("neili", -100);
                me->start_busy(3);
        } else
        {
                msg += CYN "可是$n" CYN "早已看破$N"
                       CYN "招中虚实，单手一挥，登将这招化于无形。\n" NOR;
                me->add("neili", -50);
                me->start_busy(4);
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int ap)
{
        target->set_temp("no_exert", 1);
        call_out("poqi_end", 10 + random(ap / 25), me, target);
        return  HIR "$n" HIR "只觉胸口一麻，已被$N" HIR "点中"
                "要穴，登时全身真气阻滞，苦不堪言！\n" NOR;
}

void poqi_end(object me, object target)
{
        if (target && living(target) && target->query_temp("no_exert"))
        {
                message_combatd(HIC "$N" HIC "深深吸入一口气，脸色由"
                                "白转红，看起来好多了。\n" NOR, target);

                target->delete_temp("no_exert");
                tell_object(target, HIY "你感到被扰乱的真气慢慢平静"
                                    "了下来。\n" NOR);
        }
        return;
}
