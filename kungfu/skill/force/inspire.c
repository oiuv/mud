// inspire.c

#include <ansi.h>

int exert(object me, object target)
{
        string force;

        if (userp(me) && ! me->query("breakup"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if (me->is_fighting())
                return notify_fail("现在你正在战斗中？还是等打完了再说吧！\n");

        force = me->query_skill_mapped("force");

        if (! stringp(force))
                return notify_fail("先激发你的特殊内功。\n");

        if (userp(me) && (int)me->query_skill(force, 1) < 200)
                return notify_fail("你的" + to_chinese(force) + "修为还不够。\n");

        if ((int)me->query("eff_jing") >= (int)me->query("max_jing"))
                return notify_fail("你现在精神饱满，有什么好激励的？\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的真气不够。\n");

        if ((int)me->query("eff_jing") < (int)me->query("max_jing") / 4)
                return notify_fail("你的精损伤太重，现在难以振奋自己。\n");

        message_vision(HIW "$N" HIW "盘膝坐下，闭目冥神，缓缓的呼吸吐纳。\n" NOR, me);

        me->set_temp("pending/inspiring", 1);
        me->set_short_desc("正坐在地下运功疗伤。");

        me->start_busy((:call_other, __FILE__, "inspiring" :),
                       (:call_other, __FILE__, "halt_inspiring" :));
        return 1;
}

// 振奋中
int inspiring(object me)
{
        string force;
        int recover_points;

        force = me->query_skill_mapped("force");
        if (! stringp(force))
        {
                // 没有特殊内功了？
                tell_object(me, "你一时难以定夺如何运用内力，只好先暂停疗伤。\n");
                me->set_temp("pending/inspiring", 0);
                me->set_short_desc(0);
                message_vision("$N叹了口气，摇摇晃晃的站了起来。\n", me);
                return 0;
        }

        if (me->query("eff_jing") < me->query("max_jing"))
        {
                // 需要继续疗伤
                if (me->query("neili") < 100)
                {
                        tell_object(me, "你觉得真气不济，难以在经脉中继续运转振奋。\n");
                        me->set_temp("pending/healing", 0);
                        me->set_short_desc(0);
                        message_vision("$N叹了口气，摇摇晃晃的站了起来。\n", me);
                        return 0;
                }

                recover_points = 5 + (int)me->query_skill("force") / 6;
                me->receive_curing("jing", recover_points);
                me->add("neili", -100);
                switch (random(10))
                {
                case 0:
                        tell_object(me, "你运用" + to_chinese(force) + "沿着"
                                    "诸大穴慢慢运转，振奋精神。\n");
                        break;
                case 1:
                        tell_object(me, "你将内力纳入丹田，再上行冲顶，透泥宫"
                                    "，顿觉精神爽快。\n");
                        break;
                case 2:
                        tell_object(me, "你运转内力，缓缓呼吸吐纳，额头上渗出"
                                        "点点汗珠，随即化作白雾蒸腾而起。\n");
                        break;
                }

                return 1;
        }

        // 恢复完毕
        me->set_temp("pending/exercise", 0);
        me->set_short_desc(0);
        message_vision(HIY "$N" HIY "缓缓睁开双目，精光四射，神清意爽。\n" NOR,
                       me);
        return 0;
}

// 停止疗伤
int halt_inspiring(object me)
{
        tell_object(me, "你将真气收回丹田，微微喘息，站了起来。\n");
        tell_room(environment(me), me->name() + "猛的吸一口气，突然站了起来。\n", me);
        me->set_temp("pending/inspiring", 0);
        me->set_short_desc(0);
        return 1;
}

