// puti-zi.c 菩提子

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("菩提子", ({"puti zi", "zi"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗晶莹如玉的菩提子，采自灵山佛祖座前，珍稀无比，
乃万年菩提树之实，功能化百劫，渡千灾，与天地同寿。\n");
		set("value",100);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	message_vision(HIR "$N" HIR "吃下一颗菩提子... 不好！\n" NOR, me);
	me->unconcious();
	destruct(this_object());
	return 1;
}
