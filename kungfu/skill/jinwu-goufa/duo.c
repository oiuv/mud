#include <ansi.h>
#include <combat.h>

#define DUO "「" HIY "金钩夺魄" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon, weapon2;
        int damage;
        string  msg;
        string  pmsg;
        string *limbs;
        string  limb;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/jinwu-goufa/duo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(DUO "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，无法施展" DUO "。\n");

        if (me->query_skill_mapped("sword") != "jinwu-goufa") 
                return notify_fail("你没有激发金蜈钩法，无法施展" DUO "。\n");

        if ((int)me->query_skill("jinwu-goufa", 1) < 160)
                return notify_fail("你的金蜈钩法还不够娴熟，无法施展" DUO "。\n");
                                
        if ((int)me->query("neili", 1) < 300)
                return notify_fail("你现在真气不够，无法施展" DUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "突然$N" HIY "一声冷哼，手中" + weapon->name() +
              NOR + HIY "挥出，在空中划出个美丽的弧线，直攻$n" HIY
              "的要穴！\n" NOR;
        me->add("neili", -50);

        ap = me->query_skill("jinwu-goufa", 1) +
             me->query_skill("sword", 1) / 2;
        dp = target->query_skill("parry");

        me->want_kill(target);
        if (ap / 2 + random(ap) > dp)
        {
                me->start_busy(2 + random(2));
                me->add("neili", -200);
                damage = 0;

                if (me->query("max_neili") > target->query("max_neili") * 2)
                {
                        msg += HIR "只见$N" HIR "这一击来势好快，寒光一"
                               "闪，正钩中$n" HIR "的咽喉，$n" HIR "一声"
                               "惨叫，软绵绵的瘫了下去。\n" NOR "( $n" RED
                               "受伤过重，已经有如风中残烛，随时都可能断"
                               "气。" NOR ")\n";
                        damage = -1;
                } else
                if (objectp(weapon2 = target->query_temp("weapon")) &&
                me->query_skill("sword") > target->query_skill("parry"))
                {
                        // if(userp(me))
                        msg += HIR "只听“嗤啦”一声，$n" HIR "手腕被"
                              "钩个正中，手中" + weapon2->name() + NOR
                              + HIR "再也捉拿不住，脱手而飞！\n" NOR;
                        me->start_busy(2 + random(2));
                        target->start_busy(2);
                        weapon2->move(environment(target));
                } else
                {
                        damage = ap + (int)me->query_skill("force");
                        damage = damage / 2 + random(damage / 2);
                        
                        if (arrayp(limbs = target->query("limbs")))
                                limb = limbs[random(sizeof(limbs))];
                        else
                                limb = "要害";
                        pmsg = HIR "$n" HIR "飞身躲闪，然而只听“嗤啦”"
                               "一声，$N" HIR "的" + weapon->name()+ NOR
                               + HIR "正钩在$n" HIR + limb + "上，顿时鲜"
                               "血狂溅而出。\n" NOR;
                        msg += COMBAT_D->do_damage(me, target,
                               WEAPON_ATTACK, damage, 40, pmsg);
                }
        } else 
        {
                me->start_busy(4);
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，避开了这一招。\n"NOR;
        }

        message_combatd(msg, me, target);
        if (damage < 0) target->die(me);

        return 1;
}
