// hua2.c 无名花
inherit ITEM;

void create()
{
	set_name("无名花", ({ "wuming hua", "wuming", "hua" }));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "朵");
		set("long", "这是一朵无名小花，花蕊虽小，却十分美丽。\n");
		set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
        message_vision("$N把" + name() + "扔进嘴里，几下就吞了下去。\n", me);
	destruct(this_object());
	return 1;
}

