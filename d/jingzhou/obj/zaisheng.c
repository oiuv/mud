// lianzi.c 白莲子

inherit ITEM;

void setup()
{}

void init()
{
	add_action("do_eat", "eat");
}

void create()
{
	set_name("再生丸", ({"bailian zi", "zi"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗洁白如玉的再生丸。\n");
		set("value", 2000);
	}
	setup();
}

int do_eat(string arg)
{
	if (!id(arg))
	return notify_fail("你要吃什么药？\n");

	if (((int)this_player()->query("potential") - 100) >=
	     (int)this_player()->query("learned_points") )
		return notify_fail("你现在不需要用再生丸。\n");
	else {
	        this_player()->add("potential", 1);
	        message_vision("$N吃下一颗再生丸，感到身体里产生了一种微妙的变化 !\n", this_player());
	        destruct(this_object());
	        return 1;
	}
}

