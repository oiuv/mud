// wood.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(WHT "木材" NOR, ({ "wood", "mu cai", "mu", "cai" }) );
	set_weight(5000);
	if (clonep())
        {
		set_default_object(__FILE__);
	} else
        {
                set("value", 10);
		set("unit", "捆");
		set("long", "这是一小捆木材。\n");
	}
	setup();
}

int fire(object me, object ob)
{
        object fire;

        if (environment()->query_temp("warm") >= 40)
                return notify_fail("这里已经够热的了，你还是换个地方点火吧。\n");

        message_vision("$N用" + ob->name() + "点燃了" + name() +
                       "，一片红红的火光映红了四周。\n", me);

        fire = new("/clone/misc/needfire");
        fire->move(environment(me));

        destruct(this_object());
        return 1;
}
