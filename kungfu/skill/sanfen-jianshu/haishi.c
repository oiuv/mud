// haishi.c 海市蜃楼

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
//      int delta;
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/sanfen-jianshu/haishi"))
                return notify_fail("你不会使用「海市蜃楼」这一绝技！\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail("「海市蜃楼」只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if (me->query_skill("sword", 1) < 150)
                return notify_fail("你的剑术修为不够，目前不能使用「海市蜃楼」！\n");

        if (me->query_skill("sanfen-jianshu", 1) < 150)
                return notify_fail("你的三分剑术的修为不够，不能使用这一绝技！\n");

        if (me->query_skill("dodge",1) < 150)
                return notify_fail("你的轻功修为不够，无法使用「海市蜃楼」！\n");
 
        if (me->query("neili") < 200)
                return notify_fail("你的真气不够！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "狂喝一声，手中" + weapon->name() +
              HIW "将到之际，突然圈转，使出三分剑术的独得之秘"
              "「海市蜃楼」，一招之中\n又另蕴涵三招，招式繁复狠"
              "辣，剑招虚虚实实，霍霍剑光径直逼向$n"
              HIW "！\n\n" NOR;

        me->add("neili", -150);
        ap = me->query_skill("sword");
        dp = target->query_skill("dodge");
        me->start_busy(1 + random(2));
        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 70,
                                           HIR "$n" HIR "完全无法辨清虚实，只感一阵触心的刺痛，一声惨叫，已被$N"
                                           HIR "凌厉的剑招刺中。\n" NOR);
                if (ap / 3 + random(ap) > dp)
                {
                        //damage /= 2;
                        damage = ap / 2 + random(ap / 2);
                        msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80,
                                                   HIR "\n$N" HIR "见$n" HIR "重创之下不禁破绽迭出，"
                                                   HIR "冷笑一声，手中" + weapon->name() +
                                                   HIR "挥洒，又攻出一剑，正中$p" HIR "胸口。\n" NOR);
                }
        } else
        {
                msg += HIC "$n" HIC "见状身形急退，避开了$N"
                       HIC "凌厉的攻击！\n" NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}