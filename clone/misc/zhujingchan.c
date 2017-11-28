inherit ITEM;
#include <ansi.h>

void create()
{
	set_name(HIR"朱睛"HIW"冰"HIR"蟾"NOR, ({"chan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("value", 40000);
		set("long", "这是一千年难得一见的朱睛冰蟾，通体透明，惟眼呈赤"
		            "色，能解百毒。\n");
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
        message_vision(HIR "$N" HIG "服下一只朱睛冰蟾，只觉一股丹田一片火热，"
                       "内息运转无比顺畅！\n" NOR, me);
        set_temp("nopoison", 3);
	destruct(this_object());
	return 1;
}

