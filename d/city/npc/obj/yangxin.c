// yangxin.c 养心丸

inherit ITEM;

void create()
{
	set_name("养心丸", ({"yangxin wan", "wan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗暗红发亮的养心丸。\n");
		set("value", 10000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	me->add("qi", 200);
	message_vision("$N吃下一颗养心丸，只觉得体内真力源源滋生，不绝如缕。\n", me);
	destruct(this_object());
	return 1;
}
