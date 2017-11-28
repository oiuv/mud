#include <ansi.h>
inherit COMBINED_ITEM;

string query_autoload()
{
        return query_amount() + "";
}

void create()
{
        set_name(HIY "补药" NOR, ({ "pill" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "这是一颗增加内功的补药。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 10000);
                set("base_weight", 50);
                set("only_do_effect", 1);

                // 增加技能的种类
                set("pill_skill", "force");

                // 是否为特殊武功
                set("skill_mapped", 1);

                // 技能的增加效果
                set("pill_point", 20000);

                // 功力的增加效果
                set("force_point", 3);

                // 服用成功的描述
                set("pill_msg1", HIR "你只觉一股暖气散布全身，说不出"
                                 "的舒服受用。\n" NOR);

                // 服用失败的描述
                set("pill_msg2", HIY "你只觉一股热流涌上，内息得到了"
                                 "完全的补充。\n" NOR);

                // 增加功力的描述，如果有前面两条信息，则应作缺省
                set("pill_msg3", HIM "你感到内力又雄厚了一些。\n" NOR);
                set("pill_msg4", HIR "你感到内息澎湃，难以吸收药力。\n" NOR);
        }
        setup();
}

int do_effect(object me)
{
        string skill;
        int pot1, pot2, time, ltime;
        mapping my = me->query_entire_dbase();

        pot1 = query("pill_point");
        pot2 = query("force_point");
        time = query("pill_point") / 10;

        // 非技能型的药物重新计算效用时间
        if (! query("pill_point"))
                time = 400 + query("force_point") * 10;

        // 本草知识增加药物效果
        if (me->query("special_skill/herb"))
        {
                pot1 += pot1 / 2;
                pot2 += pot2 / 2;
                time -= time / 2;
        }

        if ((int)me->query_condition("pill_drug") > 0)
        {
                write("你觉得现在内息未定，经脉隐隐还能感到真气"
                      "冲荡，不敢贸然服食。\n");

				ltime = (int)me->query_condition("pill_drug") / 6;
				if (ltime >= 480)
					write(HIB "你感觉自己要完全吸收体内的药力至少还需要四个时辰。\n" NOR);
				else if (ltime >= 360)
					write(HIB "你感觉自己要完全吸收体内的药力至少还需要三个时辰。\n" NOR);
				else if (ltime >= 240)
					write(HIB "你感觉自己要完全吸收体内的药力至少还需要两个时辰。\n" NOR);
				else if (ltime >= 120)
					write(HIB "你感觉自己要完全吸收体内的药力至少还需要一个时辰。\n" NOR);
				else if (ltime >= 60)
					write(HIB "你感觉自己要完全吸收体内的药力至少还需要半个时辰。\n" NOR);
				else if (ltime >= 15)
					write(HIB "你感觉自己要完全吸收体内的药力至少还需要一刻钟。\n" NOR);

                return 1;
        }

        // 增加药物效用时间，该时段里不能再次服用
        me->apply_condition("pill_drug", time);

        message_vision(HIY "$N" HIY "服下一" + query("base_unit") +
                       name() + HIY "，急忙开始运功吸收药力。\n"
                       NOR, me);

        // 如果该药物有增加技能的功能，则加之
        if (query("pill_skill") && query("pill_point"))
        {
                // 判断增加的技能是否为特殊技能
                if (query("skill_mapped") >= 1)
                        skill = me->query_skill_mapped(query("pill_skill"));
                else
                        skill = query("pill_skill");

                // 可以增加该技能
                if (stringp(skill) && me->can_improve_skill(skill))
                {
                        tell_object(me, query("pill_msg1"));
                        me->improve_skill(skill, pot1);
                } else
                        tell_object(me, query("pill_msg2"));
        }


        // 如果该药物有增加功力的功能，则加之
        if (query("pill_skill") && query("force_point"))
        {
                // 内功型药物增加内力，否则则增加精力
                if (query("pill_skill") == "force")
                {
                        // 提供出信息
                        if (me->query("max_neili") < me->query_neili_limit()
                           && query("pill_msg3"))
                                tell_object(me, query("pill_msg3"));
                        else
                        if (me->query("max_neili") >= me->query_neili_limit()
                           && query("pill_msg4"))
                                tell_object(me, query("pill_msg4"));

                        me->improve_neili(pot2 + random(pot2));

                        if (me->query("neili") < me->query("max_neili"))
                                my["neili"]  = my["max_neili"];
                } else
                {
                        // 提供出信息
                        if (me->query("max_jingli") < me->query_jingli_limit()
                           && query("pill_msg3"))
                                tell_object(me, query("pill_msg3"));
                        else
                        if (me->query("max_jingli") >= me->query_jingli_limit()
                           && query("pill_msg4"))
                                tell_object(me, query("pill_msg4"));

                        me->improve_jingli(pot2 + random(pot2));

                        if (me->query("jingli") < me->query("max_jingli"))
                                my["jingli"]  = my["max_jingli"];
                }
        }
        me->start_busy(random(3) + 3);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

void autoload(string param)
{
        int amt;

        if (sscanf(param, "%d", amt) == 1)
                set_amount(amt);
}

void setup()
{
        set_amount(1);
        ::setup();
}
