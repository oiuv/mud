// heal.c

#include <ansi.h>

int exert(object me, object target)
{
        string force;

        if (me->is_fighting())
                return notify_fail("战斗中运功疗伤？找死吗？\n");

        if (me->is_busy())
                return notify_fail("等你忙完了手头的事情再说！\n");

        force = me->query_skill_mapped("force");
        if (! stringp(force))
                return notify_fail("先激发你的特殊内功。\n");

        if ((int)me->query("eff_qi") >= (int)me->query("max_qi"))
                return notify_fail("你现在气血充盈，不需要疗伤。\n");

        if ((int)me->query_skill(force, 1) < 20)
                return notify_fail("你的" + to_chinese(force) + "修为还不够。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的真气不够。\n");

        if (! me->query("special_skill/divine") && (int)me->query("eff_qi") < (int)me->query("max_qi") / 5)
                return notify_fail("你已经受伤过重，只怕一运真气便有生命危险！\n");

        message_vision(HIW "$N" HIW "全身放松，坐下来开始运功疗伤。\n" NOR,
                       me);

        me->set_temp("pending/healing", 1);
        me->set_short_desc("正坐在地下运功疗伤。");
        me->start_busy((:call_other, __FILE__, "healing" :),
                       (:call_other, __FILE__, "halt_healing" :));

        return 1;
}

// 疗伤中
int healing(object me)
{
        string force;
        int recover_points;

        force = me->query_skill_mapped("force");
        if (! stringp(force))
        {
                // 没有特殊内功了？
                tell_object(me, "你一时难以定夺如何运用内力，只好先暂停疗伤。\n");
                me->set_temp("pending/healing", 0);
                me->set_short_desc(0);
                message_vision("$N叹了口气，摇摇晃晃的站了起来。\n", me);
                return 0;
        }

        if (me->query("eff_qi") < me->query("max_qi"))
        {
                // 需要继续疗伤
                if (me->query("neili") < 50)
                {
                        tell_object(me, "你觉得真气不济，难以在经脉中继续运转疗伤。\n");
                        me->set_temp("pending/healing", 0);
                        me->set_short_desc(0);
                        message_vision("$N叹了口气，摇摇晃晃的站了起来。\n", me);
                        return 0;
                }

                recover_points = 10 + (int)me->query_skill("force") / 3;

                // 天佑神躯增强疗伤效果
                if (me->query("special_skill/divine"))
                        recover_points += (int)me->query_con() * 2;

                // 打通任督二脉增强疗伤效果
                if (me->query("breakup"))
                        recover_points *= 3;

                me->receive_curing("qi", recover_points);
                me->add("neili", -50);
                switch (random(10))
                {
                case 0:
                        tell_object(me, "你运用" + to_chinese(force) + "沿着"
                                    "诸大穴慢慢运转，疗解伤痛。\n");
                        break;
                case 1:
                        tell_object(me, "你将内力纳入丹田，再上行冲顶，透泥宫"
                                    "，顿觉精神爽快。\n");
                        break;
                case 2:
                        tell_object(me, "你将内力运入四肢百赅，复又回收丹田，"
                                    "伤势痊愈不少。\n");
                        break;
                }

                return 1;
        }

        // 恢复完毕
        me->set_temp("pending/exercise", 0);
        me->set_short_desc(0);
        message_vision(HIY "$N" HIY "运功完毕，吐出一口瘀血，脸色看起来好多了。\n" NOR,
                       me);
        return 0;
}

// 停止疗伤
int halt_healing(object me)
{
        tell_object(me, "你将真气收回丹田，微微喘息，站了起来。\n");
        tell_room(environment(me), me->name() + "猛的吸一口气，突然站了起来。\n", me);
        me->set_temp("pending/healing", 0);
        me->set_short_desc(0);
        if (me->query("neili") > 100)
                me->add("neili", -100);
        else
                me->set("neili", 0);
        return 1;
}

