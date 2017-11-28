// largewood.c

#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
	set_name(WHT "大木材" NOR, ({ "large wood", "wood" }));
	if (clonep())
		set_default_object(__FILE__);
	else
        {
		set("unit", "批");
		set("long", "这是伐自长白山的上好的大木料。\n");
		set("base_value", 2000);
		set("base_unit", "根");
		set("base_weight", 50000);
	}
        set_amount(1);
}

int fire(object me, object ob)
{
        object fire;

        if (query_amount() < 1)
                return 0;

        if (environment()->query_temp("warm") >= 40)
                return notify_fail("这里已经太热了，你还是换个地方点火吧。\n");

        message_vision("$N费了好大劲，总算用" + ob->name() + "把" + name() +
                       "点着了，一片红红的火光映红了四周。\n", me);

        fire = new("/clone/misc/needfire");
        fire->move(environment(me));
        fire->set_light_time(100);

        add_amount(-1);
        return 1;
}
