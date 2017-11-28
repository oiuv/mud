#include <ansi.h>
#include <skill.h>
#include <weapon.h>
#include <combat.h>

inherit F_SSERVER;
 
int exert(object me, object target)
{
        mapping p;
        string msg;
        object ob;
        int amount;
        int exp;
        int lvl;
        int sk;

        if (! target || target == me)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target)
                return notify_fail("你要取哪只虫的毒液练药？\n");

        if (! target->is_worm())
                return notify_fail("看清楚些，那可不是毒虫。\n");

        if (living(target))
                return notify_fail("那只虫还精神着呢，你找死啊。\n");

        if ((int)me->query_skill("wudu-qishu", 1) < 100)
                return notify_fail("你的五毒奇术不够娴熟，不能炼制毒药。\n");

        if ((int)me->query_skill("xiuluo-yinshagong", 1) < 100)
                return notify_fail("你修罗阴煞功修为不够，不能炼制毒药。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在内力不足，难以炼制毒药。\n");

        me->add("neili", -50);
        me->start_busy(random(3));

        msg = HIR "\n$N" HIR "伸出食指，点在" + target->name() +
              HIR "腹部，默运内力迫出毒液练药。\n" NOR;

        p = target->query("worm_poison");
        if (! mapp(p))
                return notify_fail("看来你是弄不出什么毒液来了。\n" NOR);

        lvl = (int)me->query_skill("poison", 1) / 3 +
              (int)me->query_skill("wudu-qishu", 1) / 3 +
              (int)me->query_skill("xiuluo-yinshagong", 1) / 3;

        amount = p["level"] * p["remain"];
        if (amount > lvl)
                amount = lvl;
        
        p["remain"] = (p["level"] * p["remain"] - amount) /
                       p["level"];
        target->apply_condition("poison-supply", 1);

        if (! amount)
        {
                msg += WHT "$N" WHT "挤了半天，结果啥也没有挤出来，算是"
                       "白忙活了。\n\n" NOR;
                message_vision(msg, me);
                return 1;
        }

        if (amount < lvl)
        {
                msg += WHT "$N" WHT "挤了一点毒液出来。\n" NOR;
                message_vision(msg, me);
                tell_object(me, HIY "可惜这点毒液连炼一颗毒药都不够。\n\n" NOR);
                return 1;
        }

        msg += HIW "$N" HIW "将" + target->name() + HIW "的毒液逼出，在"
               "内力的作用下化成了一颗晶莹剔透的药丸。\n" NOR;
        message_vision(msg, me);
        tell_object(me, HIC "你炼制了一颗虫毒药丸。\n\n" NOR);

        exp = lvl / 4;
        me->improve_skill("poison", 2 + random(exp));
        if (me->can_improve_skill("wudu-qishu"))
                me->improve_skill("wudu-qishu", 2 + random(exp / 2));

        if (me->can_improve_skill("xiuluo-yinshagong"))
                me->improve_skill("xiuluo-yinshagong", 2 + random(exp / 3), 1);

        ob = new("/clone/misc/chongdu");
        ob->set("poison", ([
                "level" : lvl,
                "id"    : me->query("id"),
                "name"  : "虫毒",
                "duration" : 10,
        ]));
        ob->move(me, 1);

        return 1;
}

