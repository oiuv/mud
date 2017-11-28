#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + HIC "龟苓膏" NOR, ({ "guiling gao", "guiling", "gao" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("long", HIC "这是一块用乌龟甲和茯苓配置成的龟苓"
                            "膏，功能延年益寿。\n" NOR);
                set("value", 3000);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        int na, un;
        mapping my = me->query_entire_dbase();

        na = this_object()->name();
        un = this_object()->query("unit");

        if ((int)me->query_condition("pill_drug") > 0)
        {
                write("你觉得现在内息未定，经脉隐隐还能感到真气冲荡，不"
                      "敢贸然服食。\n");
                return 1;
        }

        me->apply_condition("pill_drug", 2000);

        message_vision(HIC "$N" HIC "服下一" + un + na + HIC "，急忙开始运功吸"
                       "收药力。\n" NOR, me);

        if (me->query("max_jingli") < 1000)
	{
                tell_object(me, HIC "你只觉得精神健旺之极，精力直欲奔腾而出。\n" NOR);
                me->improve_jingli(5 + random(5));
	} else
                tell_object(me, HIC "你只觉精神饱满之极，全身的疲惫一扫而空。\n" NOR);

        if (me->query("jingli") < me->query("max_jingli"))
                my["jingli"]  = my["max_jingli"];

        me->start_busy(random(5) + 5);
        destruct(this_object());
        return 1;
}
