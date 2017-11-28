// yangxin.c 养心丸

inherit ITEM;

void setup()
{}

void init()
{
	add_action("do_eat", "eat");
}

void create()
{
	set_name("养心丸", ({"yangxin wan", "wan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗暗红发亮的养心丸。\n");
		set("value", 10000);
	}
	setup();
}

int do_eat(string arg)
{
	if (!id(arg))
	return notify_fail("你要吃什么？\n");

	this_player()->add("qi", 200);
	message_vision("$N吃下一颗养心丸，只觉得体内真力源源滋生，不绝如缕。\n", this_player());
	destruct(this_object());
	return 1;
}


