#include <ansi.h>
#include <skill.h>
#include <weapon.h>
#include <combat.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int lvl;
 
        weapon = me->query_temp("weapon");

        if (! target)
                return notify_fail("你要打哪条蛇？\n");

        if (! target->is_snake())
                return notify_fail("看清楚些，那不是蛇，你瞎打什么？\n");

        if (! living(target))
                return notify_fail("那条蛇暂时不会动弹了，你不必再打了。\n");

        if ((int)me->query_skill("shedu-qiqiao", 1) < 20)
                return notify_fail("你的蛇毒奇巧还不够娴熟，不能打蛇。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功的修为不够，不能打蛇。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在的内力不够了。\n");

        if (weapon)
                msg = HIC "\n$N" HIC "舞动手中的" + weapon->name() +
                      HIC "，朝着" + target->name() + HIC "的七寸打"
                      "了过去。\n" NOR;
        else
                msg = HIC "\n$N" HIC "伸出双指，出指如风，迅疾无比的"
                      "朝着" + target->name() + HIC "的七寸点了过去"
                      "。\n" NOR;

        lvl = (int) me->query_skill("shedu-qiqiao", 1) +
              (int) me->query_skill("dodge");
        lvl = lvl * lvl / 10 * lvl;

        if( lvl / 2 + random(lvl) > (int) target->query("combat_exp") )
        {
                msg += HIY "结果只听“啪”的一声，正打在" + target->name() +
                       HIY "的七寸上。\n" NOR;
                lvl = (int) me->query_skill("force");
                lvl = lvl * 13 / 10;
                lvl = lvl * lvl / 10 * lvl;
                if ( lvl / 2 + random(lvl) > (int) target->query("combat_exp") )
                {
                        msg += HIM "只见" + target->name() + HIM
                               "身子轻轻晃动几下，就不再动弹了。\n" NOR;
                        message_vision(msg, me);
                        target->unconcious();
                } else
                {
                        msg += HIR + "哪里想到" + target->name() +
                               HIR "挨了这一击，竟然若无其事，顿时一个翻"
                               "身，直扑向$N" HIR "！\n\n" NOR;
                        message_vision(msg, me);
                        target->kill_ob(me);
                }
        } else
        {
                msg += WHT "然而" + target->name() + WHT "身子一闪，躲了过去。\n\n" NOR;
                message_vision(msg, me);
                target->kill_ob(me);
        }
        me->add("neili", -50);
        me->start_busy(2);

        return 1;
}
