#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIM "地脉血泉" NOR, ({ "dimai xuequan", "dimai", "xuequan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("long", HIM "这是一块散发着血色光泽的晶体，世间罕有。\n" NOR);
                set("value", 30000);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        string mapsk;
        int na, un;
        mapping my = me->query_entire_dbase();

        na = query("name");
        un = query("unit");

        if ((int)me->query_condition("pill_drug") > 0)
        {
                write("你觉得现在内息未定，经脉隐隐还能感到真气冲荡，不"
                      "敢贸然服食。\n");
                return 1;
        }

        me->apply_condition("pill_drug", 4000);

        message_vision(HIY "$N" HIY "吞下一" + un + na + HIY "，脸色一变，似"
                       "乎精神了许多。\n" NOR, me);

        mapsk = me->query_skill_mapped("force");

        if (me->can_improve_skill("force")
           || (stringp(mapsk) && me->can_improve_skill(mapsk)))
	{
        	if (me->can_improve_skill("force"))
                	me->improve_skill("force", 20000);

        	if (stringp(mapsk) && me->can_improve_skill(mapsk))
                	me->improve_skill(mapsk, 20000);

        	tell_object(me, HIR "你只觉一股暖气散布全身，说不出的舒服受用。\n" NOR);
	} else
        	tell_object(me, HIY "你只觉一股热流涌上，内息得到了完全的补充。\n" NOR);

        me->improve_neili(100 + random(101));

        if (me->query("neili") < me->query("max_neili"))
	        my["neili"]  = my["max_neili"];

        me->start_busy(random(8) + 8);
        destruct(this_object());
        return 1;
}

int query_autoload()
{
        return 1;
}

