// xuanbing-jiu.c
// by vin

#include <ansi.h>
inherit F_CLEAN_UP;

string chinese_name() { return "玄冰碧火酒毒素"; }

int dispel(object me, object ob, int duration)
{
        int f, n, lvl;
        f = me->query_skill_mapped("force");
        lvl = me->query_skill("force");

        if (me != ob)
        {
                tell_object(ob, "你只觉" + me->name() + "的内力使得热寒两股真"
                                "气抗拒得更为激烈，登时眼前一黑。\n");

                tell_object(me, "你试图帮助" + ob->name() + "解毒，却发现对方"
                                "热寒两股真气顿生反弹，不由大惊，连忙住手。\n");

                if (living(ob))
                        ob->unconcious();

                return -1;
        }

        if (me->query_skill_mapped("force") != "luohan-fumogong")
        {
                tell_object(me, HIB "你觉得全身忽如" HIW "冰彻" NOR +
                                HIB "，忽如" HIR "火炙" NOR + HIB "。"
                                "全然无法将内息凝聚。\n" NOR);
                return -1;
        }

        if (me->query_skill("luohan-fumogong", 1) < 180)
        {
                tell_object(me, HIB "你发现自身的" + to_chinese(f) +
                                HIB "修为不足，难以将体内的阴阳两种"
                                "真气调和。\n");
                return -1;
        }

        n = me->query_condition("xuanbing-jiu") - lvl / 15;

        tell_object(me, "你默默的运用" + to_chinese(f) + "化解体内"
                        "的异种真气。\n");

        if (n < 1)
        {
                me->clear_condition("xuanbing-jiu");

                if (me->can_improve_skill("force"))
                        me->improve_skill("force", 3000);

                if (me->can_improve_skill("luohan-fumogong"))
                        me->improve_skill("luohan-fumogong", 3000);

               // if (me->add("can_perform/luohan-fumogong/jiu", 1 + random(5)) < 100)
               //降低解冰火九重天的难度 by 薪有所属
               if (me->add("can_perform/luohan-fumogong/jiu", 1 + random(5)) < 10)
                {
                        tell_object(me, HIC "\n突然间你发觉体内阴阳两种真"
                                        "气慢慢交融，说不出的舒服受用。\n"
                                        "\n" NOR);
                } else
                {
                        me->set("skybook/item/xuanbingjiu", 1);
                        tell_object(me, HIW "\n你发觉体内阴阳两种真气慢慢"
                                        "交融，竟使得内功达到了一个前所未"
                                        "有的境界。\n\n" HIC "你对罗汉伏魔"
                                        "神功有了新的领悟。\n" NOR);
                        tell_object(me, HIC "你学会了「" HIW "冰" HIR "火"
                                        HIW "九重天" HIC "」。\n" NOR);
                        if (me->can_improve_skill("force"))
                                me->improve_skill("force", 1500000);
                        if (me->can_improve_skill("force"))
                                me->improve_skill("force", 1500000);
                        if (me->can_improve_skill("force"))
                                me->improve_skill("force", 1500000);
                        if (me->can_improve_skill("luohan-fumogong"))
                                me->improve_skill("luohan-fumogong", 1500000);
                        if (me->can_improve_skill("luohan-fumogong"))
                                me->improve_skill("luohan-fumogong", 1500000);
                        if (me->can_improve_skill("luohan-fumogong"))
                                me->improve_skill("luohan-fumogong", 1500000);
                        me->improve_skill("martial-cognize", 1500000);
                        me->improve_skill("martial-cognize", 1500000);
                        me->improve_skill("martial-cognize", 1500000);
                        tell_object(me, "\n");
                }
        } else
                me->apply_condition("xuanbing-jiu", n);

        return 1;
}

int update_condition(object me, int duration)
{
	// int limit;

	if (! living(me) && (me->query("eff_qi") < 20
    || me->query("eff_jing") < 10))
  {
        me->set_temp("贪饮玄冰碧火酒，内息紊乱而亡");
        me->die();
        return 0;
	} else {
        me->receive_wound("qi", 20);
        me->receive_wound("jing", 10);

        if (me->query("max_neili"))
                me->add("max_neili", -1);

        switch (random(3))
        {
        case 0:
                tell_object(me, HIR "突然间你只觉丹田处有如火烧，全身"
                                "真气鼓荡，便似要爆裂开一般。\n" NOR);
                message("vision", HIR "忽见" + me->name() + HIR "须发"
                        "焦卷，全身散发着滚滚热气，嘶哑着嗓子乱嚎。\n"
                        NOR, environment(me), me);
                break;

        case 1:
                tell_object(me, HIW "霎时你只觉如同置身冰坚地狱，寒气"
                                "瞬间游遍全身，说不出的难受。\n" NOR);
                message("vision", HIW "忽见" + me->name() + HIW "散发"
                        "出丝丝寒气，全身上下竟然被罩上了一层薄冰。\n"
                        NOR, environment(me), me);
                break;

        default:
                tell_object(me, HIB "你只觉丹田处两种真气相互抵触，忽"
                                "如" HIW "冰彻" NOR + HIB "，忽如" HIR
                                "火炙" NOR + HIB "，苦不勘言。\n" NOR);
                message("vision", HIB "突然" + me->name() + HIB "一声"
                        "尖啸，脸部扭曲得不成人样，在地上不住颤抖。\n"
                        NOR, environment(me), me);
                break;
        }
	}

        if (me->query("max_neili") < 1)
                me->set("max_neili", 0);

	me->apply_condition("xuanbing-jiu", duration - 1);

	if (! duration)
                return 0;

	return 1;
}
