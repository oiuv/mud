
#include <ansi.h>

inherit F_SSERVER;

#define TAO "「" HIG "碧焰滔天" NOR "」"

int unconcious_me(object me);

int perform(object me, object target)
{
        object du;
        int damage;
        int ap;
        string msg;
        int lvl;

        if (userp(me) && ! me->query("can_perform/chousui-zhang/tao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("你只能对战斗中的对手施展" TAO "。\n");

        if ((int)me->query_skill("chousui-zhang", 1) < 220)
                return notify_fail("你的抽髓掌火候不够。\n");

        if ((int)me->query_skill("poison", 1) < 250)
                return notify_fail("你的基本毒技火候不够。\n");

        if ((int)me->query_skill("huagong-dafa", 1) < 220)
                return notify_fail("你的化功大法火候不够。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不足，无法用内力施展" TAO "。\n");

        if ((int)me->query("neili") < 3000)
                return notify_fail("你现在内息不足，无法用内力施展" TAO "。\n");

        if (me->query_skill_prepared("strike") != "chousui-zhang")
                return notify_fail("你还没有准备抽髓掌，无法施展" TAO "。\n");

        if (! me->query_temp("powerup"))
                return notify_fail("你必须将全身功力尽数提起才能施展" TAO "。\n");

        if (! objectp(du = me->query_temp("handing")) && userp(me))
                return notify_fail("你首先要拿着(hand)一些毒药作为引子。\n");

        if (objectp(du) && ! mapp(du->query("poison")))
                return notify_fail(du->name() + "又不是毒药，无法运射出毒焰？\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "只见$N" HIR "双目血红，头发散乱，猛地仰天发出一声悲啸。\n\n"
              "$N" HIR "把心一横，在自己舌尖狠命一咬，将毕生功力尽"
              "数喷出，顿时只见空气中血雾弥漫，腥臭无比，随即又\n"
              "听$N" HIR "骨骼“噼里啪啦”一阵爆响，双臂顺着喷出的"
              "血柱一推，刹那间一座丈来高的奇毒火墙拔地而起，带\n"
              "着排山倒海之势向$n" HIR "涌去！\n" NOR;
        me->start_busy(4 + random(4));
        me->set("neili", 0);
        me->add("max_neili", -50);

        lvl = me->query_skill("chousui-zhang", 1);
        damage = 1500 + random(lvl * 3);

        if (me->query("max_neili") + random(me->query("max_neili")) <
            target->query("max_neili") * 18 / 10)
        {
                msg += WHT "$n" WHT "见状连忙提运内力，双臂猛"
                       "的推出，掌风澎湃，强大的气流顿时将火浪"
                       "刮得倒转，竟然掉头向$N" WHT "扑去。\n\n" NOR;
                msg += HIR "$N" HIR "一声惨笑，长叹一声，眼前一黑，倒在了地上。\n\n" NOR;
                me->add("max_neili", -random(50));

                remove_call_out("unconcious_me");
                call_out("unconcious_me", 1, me);               

        } else
        {
                ap = me->query_skill("poison", 1) / 2 +
					 me->query_skill("force, 1");
                     //me->query_skill("force");
                if (ap + random(ap) < target->query_skill("dodge"))
                {
                        msg += CYN "$n" CYN "见势不妙，急忙腾挪身形，避开了$N" CYN "的攻击。\n" NOR;
                        me->add("max_neili", -random(50));
                        if (! target->is_busy())
                                target->start_busy(5);
                } else
                {
                        msg += HIR "$n" HIR "见滔天热浪扑面涌来，只觉眼前一片通红，"
                               "已被卷入火浪，毒焰席卷全身，连骨头都要烤焦一般。\n" NOR;
                        me->add("max_neili", -random(50));
                        target->affect_by("fire_poison",
                                       ([ "level" : me->query("jiali") * 3 + random(me->query("jiali") * 2),
                                          "id"    : me->query("id"),
                                          "duration" : lvl / 20 + random(lvl) ]));
                        target->receive_damage("qi", damage * 2);
                        target->receive_damage("jing", damage / 2);
                        if (! target->is_busy())
                                target->start_busy(10);
                }
        }

        if (objectp(du)) destruct(du);
        message_vision(msg, me, target);
        me->want_kill(target);
        if (! target->is_killing(me)) target->kill_ob(me);

        return 1;
}

int unconcious_me(object me)
{
        if (! objectp(me))
              return 1;

        if (living(me))
              me->unconcious();

        return 1;
}
