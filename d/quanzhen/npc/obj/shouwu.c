inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(NOR + WHT "何首乌" NOR, ({ "he shouwu", "he", "shouwu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
	        set("long", NOR + WHT "这是一支已成人形的何首"
                            "乌，看来可以入药。\n" NOR);
        	set_weight(800);
                set("value", 10000);
	        set("unit", "支");
        	set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        if ((int)me->query("max_jingli") < 100)
	{
        	write(HIW "你吃下了一支何首乌，只觉得精神健旺之极。\n" NOR);
                me->improve_jingli(2 + random(1));
        } else
	{
                write(HIC "你吃下了一支何首乌，但是好象没什么用。\n" NOR);
        }
        destruct(this_object());
        me->unconcious();
        return 1;
}
