// kuangquan.c 矿泉水

#include <ansi.h>

inherit ITEM;

int filter_user(object ob);

void create()
{
	set_name(HIG "矿泉水" NOR, ({ "water" }));
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "这是一瓶矿泉水，可以治疗口干舌"
                            "燥，遭受飞弹袭击以后感觉格外良好。\n");
                set("value", 8000);
                set("no_sell", 1);
                set("unit", "瓶");
	}
}

void init()
{
        add_action("do_drink", "drink");
}

int do_drink(string arg)
{
        object me;

        if (! arg || ! id(arg))
                return notify_fail("你要喝什么？\n");

        me = this_player();
        message_vision(HIG "$N掏出一瓶" + name() + HIG
                       "，“咕咚咕咚”喝了个干干净净。\n" NOR, me);
        me->set("water", me->max_water_capacity());
        me->permit_say(60);
        destruct(this_object());
        return 1;
}
