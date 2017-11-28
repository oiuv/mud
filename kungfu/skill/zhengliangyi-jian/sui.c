#include <ansi.h>
#include <combat.h>

#define SUI "「" HIW "玉碎昆冈" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;
        string pmsg;
        string *limbs;
        string  limb;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/zhengliangyi-jian/sui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(SUI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，无法施展" SUI "。\n");

        if ((int)me->query_skill("zhengliangyi-jian", 1) < 180)
                return notify_fail("你的正两仪剑法不够娴熟，难以施展" SUI "。\n");

        if ((int)me->query_skill("force") < 250)
                return notify_fail("你的内功火候不足，难以施展" SUI "。\n");

        if (me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不足，难以施展" SUI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" SUI "。\n");

        if (me->query_skill_mapped("sword") != "zhengliangyi-jian") 
                return notify_fail("你没有激发正两仪剑法，难以施展" SUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "仰天一声惨笑，将" + weapon->name() + HIY
              "剑尖指向自己胸口，剑柄斜斜向外，连人带剑电射而出，直"
              "扑$n" HIY "而去！\n" NOR;
        me->add("max_neili", -50);

        me->want_kill(target);
        target->kill_ob(me);
        ap = me->query_skill("sword");
        dp = target->query_skill("force");

        if (ap / 2 + random(ap * 3 / 2) > dp)
        {
                me->start_busy(6);
                me->set("neili", 0);
                me->add("max_neili", -random(50));
                damage = 0;

                if (ap < dp * 3 / 4 &&
                   me->query("max_neili") < target->query("max_neili") * 3 / 4)
                {
                        msg += HIY "可是$n" HIY "一声冷哼，飞身闪开来招，又顺势转身一"
                               "掌拍向$N" HIY "面门。\n" NOR + HIR "只听“喀嚓”一声"
                               "，$n" HIR "那掌正好打在$N" HIR "头顶，$N" HIR "哀嚎一"
                               "声，软软的瘫倒。\n" NOR;
                        message_combatd(msg, me, target);
                        me->set_temp("die_reason", "使用一招玉碎昆冈，拼命不成，反被"
                                     + target->name() + "击毙");
                        me->die(target);
                        return 1;
                } else
                if (ap > dp &&
                   me->query("max_neili") > target->query("max_neili"))
                {
                        msg += HIR "$n" HIR "眼见$N" HIR "来势如此凶悍，这一招决计无"
                               "法抵挡，骇怖达于极点，竟致僵立，束手待毙。\n只听“噗"
                               "嗤”一声，" + weapon->name() + HIR "已然透过$n" HIR
                               "前胸而入，喷出一股血雨。\n" NOR;
                        message_combatd(msg, me, target);
                        target->set_temp("die_reason", "被" + me->name() + "使一招玉"
                                         "碎昆冈刺死了");
                        target->die(me);
                        return 1;
                } else
                if (ap / 2 + random(ap * 2 / 3) > dp)
                {
                        msg += HIR "$n" HIR "眼见$N" HIR "来势如此凶悍，只觉这一招决"
                               "计无法抵挡，骇怖达于极点，慌乱之中一掌猛拍而出，击\n"
                               "向$N" HIR "面门，竟也是同归于尽的招数。只听“噗嗤”一"
                               "声，" + weapon->name() + HIR "已然透过$n" HIR "前胸，"
                               "喷出一股血雨。\n同时$n" HIR "那一掌也正好打在$N" HIR
                               "头顶，听得“喀嚓”一声，$N" HIR "头盖骨完全碎裂，软软"
                               "的瘫倒。\n" NOR;
                        message_combatd(msg, me, target);
                        me->set_temp("die_reason", "使用一招玉碎昆冈与" +
                                     target->name() + "同归于尽了");
                        target->set_temp("die_reason", "被" + me->name() + "使一招玉"
                                         "碎昆冈，两人一块去见了黑白无常");
                        target->die(me);
                        me->die();
                        return 1;
                } else
                {
                        target->start_busy(2 + random(6));
        
                        damage = ap + (int)me->query_skill("force");
                        damage = damage / 2 + random(damage);

                        if (arrayp(limbs = target->query("limbs")))
                                limb = limbs[random(sizeof(limbs))];
                        else
                                limb = "要害";
                        pmsg = HIR "$n" HIR "眼见$N" HIR "来势如此凶悍，只觉这一招决"
                               "计无法抵挡，急忙飞身闪避，然而只听“嗤啦”一声，那\n"
                               "柄" + weapon->name() + HIR "已然刺穿" + limb + HIR "，"
                               "喷出一股血雨。\n" NOR;
                        msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage,
                               150, pmsg);
                }
        } else 
        {
                me->start_busy(8);
                msg += HIY "可是$n" HIY "早已料到$N"
                       HIY "有此一着，身形急动，躲开"
                       "了这一杀着。\n" NOR;
        }
        message_combatd(msg, me, target);
        return 1;
}

