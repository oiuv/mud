#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
	set_name(YEL "水烟筒" NOR, ({"yan tong", "yan", "tong"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", YEL "这是一支云南人喜爱的水烟筒。你可"
                            "以用(fire)来吸烟。\n" NOR);
		set("unit", "个");
		set("value", 100);
		set("material", "steel");
                set("wield_msg", "$N从身后抽出$n握在手中当做武器。\n");
                set("unwield_msg", "$N将手中的$n放了回去。\n");
	}
	init_staff(10);
        setup();
}

int init()
{
	add_action("do_fire", "fire");
}

int do_fire(string arg)
{	
	object me = this_player();
	object ob = present("shui yan", me);

	if (arg != "yan" || ! arg)
		return notify_fail("你要干什么？\n");

        if (me->is_busy())
                return notify_fail("慢慢吸，小心别呛着了。\n");

        if (! objectp(ob))
                return notify_fail("你已经没有烟了。\n");

	message_vision(HIW "$N" HIW "拿起水烟筒咕咕的吸了几口，缓缓"
                       "的吐出烟雾，只觉的精神好多了。\n" NOR, me);
	me->add("jing", 50);
	if ((int)me->query("jing") > (int)me->query("max_jing") * 2)
	me->set("jing", (int)me->query("max_jing") * 2);
        me->start_busy(2);
	destruct(ob);

	return 1;
}

	