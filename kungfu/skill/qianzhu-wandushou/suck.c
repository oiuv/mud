#include <ansi.h>
inherit F_SSERVER;

int perform(object me,object target)
{
        // int sp, dp, temp;
        int my_skill, my_force, tg_age, skill_count, duli;

        if (userp(me) && ! me->query("can_perform/qianzhu-wandushou/suck"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (environment(me)->query("no_fight"))
                return notify_fail("这里太嘈杂，你不能静下心来修炼。\n");

        if( !objectp(target)
        ||  target->query_temp("owner_id") != me->query("id") )
                return notify_fail("你要吸取什么毒虫的毒素？\n");

     /*   if( target->query("age") < 99 )
                return notify_fail("你看清楚点，那东西像是毒虫吗？\n"); */
	if( ! target->query("worm_poison") )
		  return notify_fail("你看清楚点，那东西像是毒虫吗？\n");

        my_skill = (int)me->query_skill("qianzhu-wandushou", 1);
        my_force = (int)me->query_skill("xiuluo-yinshagong", 1);
        tg_age = (int)target->query("age");

        if( my_skill < 100 )
                return notify_fail("你的千蛛万毒手火候太浅，不能用来吸取毒素！\n");

        if( objectp(me->query_temp("weapon")) )
                return notify_fail("你必须空手才能修炼千蛛万毒手！\n");

        if( me->is_fighting() )
                return notify_fail("战斗中无法修炼千蛛万毒手！\n");

        if( me->is_busy() )
                return notify_fail("你正忙着呢！\n");

        if( target->is_fighting() || target->is_busy() )
                return notify_fail("毒虫正忙着呢，不能和你配合！\n");

        if( me->query_temp("wudu_suck") )
                return notify_fail("你正在修炼中！\n");

        if (! me->can_improve_skill("qianzhu-wandushou"))
                return notify_fail("你的实战经验不够，无法继续修炼千蛛万毒手！\n");


         if( tg_age - my_skill >= 50 )
                return notify_fail(target->query("name") + "的毒力对你来说太强了，小心把小命送了！\n");
         if( my_skill - tg_age >= 50 )
                return notify_fail(target->query("name") + "的毒力对你来说已经太轻微了！\n");

        if( (int)me->query("neili") < 200 )
                return notify_fail("你的内力不够，不足以对抗毒气，别把小命送掉。\n");

        if( (int)target->query("qi") < 50 )
                return notify_fail( target->query("name") + "已经奄奄一息了，你"
                                    "无法从他体内吸取任何毒素！\n");

        if( (int)me->query("qi") < 200 )
                return notify_fail( "你快不行了，再练会送命的！\n");

        tell_object(me, RED "你小心翼翼的将手伸到" + target->query("name") +
                        RED "的面前，它张嘴就咬住了你的中指。你深吸一口\n气，"
                        "面上顿时罩着一股黑气，豆大的汗珠从额头滚了下来。你只"
                        "觉得" + target->query("name") + RED "的\n毒素自伤处"
                        "源源不绝地流了进来，随真气遍布全身。\n\n" NOR );

        target->receive_wound("qi", 5);

        if( tg_age < 200 )
        {
                duli = 3;
        }

        if( tg_age > 200 && tg_age < 300)
        {
                duli = 5;
        }

        if( tg_age > 300 )
        {
                duli = 7;
        }

        //skill_count = duli * (10 + random((int)me->query_int()));
        skill_count = duli * (50 + random((int)me->query_int()));
        me->improve_skill("qianzhu-wandushou", skill_count);
        me->improve_skill("poison", skill_count);
        tell_object(me, HIC "你的「千蛛万毒手」和「基本毒技」熟练度提高了！\n" NOR);

        me->set_temp("wudu_suck", 1);
        call_out("del_wudusuck", 3, me, target);
        return 1;
}

void del_wudusuck(object me,object target)
{
        if( me->query_temp("wudu_suck") )
        {
                me->delete_temp("wudu_suck");
                tell_object(me, RED "\n只见它的肚子越涨越大，“吧嗒”一声，松"
                                "开口掉在了地上。" + target->query("name") + RED
                                "吸饱了鲜\n血，身上透出一层宝光，身子顿时涨大"
                                "了许多！\n\n\n" NOR,);
                me->receive_damage("qi", 20);
        }

        target->set_temp("nopoison", 0);
}
