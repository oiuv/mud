#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        me->clean_up_enemy();
        if (! target) target = me->select_opponent();

        if (! target || ! me->is_fighting(target))
                return notify_fail("御剑飞升只能对战斗中的对手使用。\n");

        if( me->query_temp("jueji/sword/feisheng") )
                return notify_fail( WHT "你无法连续使用「御剑飞升」绝技！\n" NOR );

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query_skill("sword", 1) < 400)
                return notify_fail("你的剑法尚达不到「御剑飞升」的境界。\n");

        if ((int)me->query_skill("force") < 400)
                return notify_fail("你的内功火候尚达不到「御剑飞升」的境界。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为太弱，无法灵活的御驾内力。\n");

        if ((int)me->query("neili") < 1500)
                return notify_fail("你现在内力不够。\n");

        msg = HIW "\n$N" HIW "一声巨喝，聚气入腕，只听破空声一响，手中"
             + weapon->name() + HIW "携着隐隐风雷之劲向$n" HIW "澎湃贯"
              "\n出，疾若电闪，势如雷霆。\n" NOR;

        damage = (int)me->query_skill("sword", 1) +
                 (int)me->query_skill("force", 1) +
                 (int)me->query_skill("parry", 1) +
                 (int)me->query_skill("martial-cognize", 1) / 2;

        damage = damage / 4 + random(damage / 4);

        me->start_busy(2 + random(4));
        me->set_temp("jueji/sword/feisheng", 1);
        call_out("end_perform2", 600, me, weapon, damage); 

        if (random(me->query_skill("force")) > target->query_skill("force") * 3 / 5)
        {
                me->add("neili", -1000);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,
                                           HIR "$n" HIR "看到$N" HIR "这气拔千钧的一击，竟不"
                                           "知如何招架，登时受了重创！\n" NOR);
                message_vision(msg, me, target);
                remove_call_out("perform2");
                call_out("perform2", 2, me);
                return 1;
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，斜跃避开。\n" NOR;
                message_vision(msg, me, target);
                me->add("neili", -100);
                remove_call_out("perform2");
                call_out("perform2", 2, me, target);
                return 1;
        }
        message_combatd(msg, me, target);

        return 1;
}

int perform2(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
        {
                write(HIW "你运转内力，仰天一声清啸，剑在空中盘旋了一圈，又"
                      "飞回了你的手中。\n" NOR);
                call_out("end_perform2", 1, me, weapon, damage); 
                return 1;
        }

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
        {
                write(HIW "你停止使用「御剑飞升」绝技。\n" NOR);
                call_out("end_perform2", 30, me, weapon, damage); 
                return 1;
        }

        if ((int)me->query("neili") < 150)
        {
                write(HIW "你剑至中途，可怎奈内息不足，只好停止御剑。\n" NOR);
                call_out("end_perform2", 30, me, weapon, damage); 
                return 1;
        }

        msg = HIW "\n$N" HIW "手中御剑凌驾如飞，宛若游龙，灵转千变，一道道"
                  "凌厉剑气疾射而出。\n" NOR;

        if (random(me->query_skill("force")) > target->query_skill("force") / 2)
        {
                damage = (int)me->query_skill("sword", 1) +
                         (int)me->query_skill("force", 1) +
                         (int)me->query_skill("parry", 1) +
                         (int)me->query_skill("martial-cognize", 1) / 2;

                damage = damage / 5 + random(damage / 5);

                me->add("neili", -100);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,
                                           HIR "只听「嗤啦」一声，" HIW "无形剑气" NOR +
                                           HIR "竟在$n" HIR "上身刺出一个血洞，数股血柱"
                                           "疾射而出！\n" NOR);
                message_vision(msg, me, target);
                remove_call_out("perform2");
                call_out("perform2", 4, me);
                return 1;
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，斜跃避开。\n" NOR;
                message_vision(msg, me, target);
                me->add("neili", -100);
                remove_call_out("perform2");
                call_out("perform2", 4, me);
                return 1;
        }
        message_combatd(msg, me, target);

        return 1;
}

void end_perform2(object me)
{
        if (! me) return;
        if (! me->query_temp("jueji/sword/feisheng")) return;
        me->delete_temp("jueji/sword/feisheng");
        tell_object(me, HIW "\n你经过调气养息，又可以继续使用「"
                        "御剑飞升」了。\n" NOR); 
}


