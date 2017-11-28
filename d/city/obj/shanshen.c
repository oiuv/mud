// shanshen.c 老山叁

inherit ITEM;

void create()
{
	set_name("老山叁", ({"laoshan shen", "shen"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "株");
		set("long", "这是一株沾满山泥的长白老山叁。\n");
		set("value", 10000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	this_player()->add("eff_qi", 200);
	message_vision("$N吃下一株老山叁，只觉得浑身一股热气兜底冒了上来！\n", me);
	destruct(this_object());
	return 1;
}
