// yaofen.c 药粉

inherit ITEM;

void create()
{
	set_name("药粉", ({ "yao fen" , "yao", "fen" }));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "包");
		set("long", "这是一包专治内伤的药粉。\n");
		set("value", 1000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	write("你吃了一点药粉，觉得眼睛有些痛。\n");
        return 1;
}
