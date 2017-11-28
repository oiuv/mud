// shuzhi.c

#include <weapon.h>
#include <ansi.h>

inherit STAFF;

void create()
{
        set_name(GRN"大树枝"NOR, ({ "shu zhi"}));
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "根");
        set("long", "这是一根爬山用的树枝。\n");
        set("value", 50);
		set("material", "wood");
		set("wield_msg", "$N拿出一根$n，握在手中。\n");
		set("unwield_msg", "$N放下手中的$n。\n");
	}

	init_staff(5);
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
