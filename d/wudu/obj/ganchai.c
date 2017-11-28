#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + WHT "干柴" NOR, ({ "gan chai", "gan", "chai" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
        	set("unit", "捆");
        	set("long", WHT "这是一捆木柴。\n" NOR);
        	set("value", 10);
                set("material", "wood");
        }
}

int fire(object me, object ob)
{
        object fire;

        if (environment()->query_temp("warm") >= 40)
                return notify_fail("这里已经够热的了，你还是换个"
                                   "地方点火吧。\n");

        message_vision("$N用" + ob->name() + "点燃了" + name() +
                       "，一片红红的火光映红了四周。\n", me);

        fire = new("/clone/misc/needfire");
        fire->move(environment(me));

        destruct(this_object());
        return 1;
}