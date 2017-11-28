// baiyunwan.c 白云熊胆丸

inherit ITEM;

void create()
{
	set_name("白云熊胆丸", ({"baiyunxiudan wan", "wan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "颗");
		set("long", "这是一颗武林人士梦寐以求的疗伤圣药。\n");
		set("value", 50000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	me->receive_curing("qi", 800);
	me->receive_curing("jing", 400);
	message_vision("$N吃下一颗白云熊胆丸，只觉精气上升，气色大好。\n", me);
	destruct(this_object());
	return 1;
}
