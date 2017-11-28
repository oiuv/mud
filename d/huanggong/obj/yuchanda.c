// yuchanda.c

inherit ITEM;

void create()
{
	set_name("雪参玉蟾丹", ({"yuchan dan", "dan"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "丸");
		set("long", "\n这是高丽进贡的灵药，服后解毒疗伤，灵验非凡。\n");
		set("value", 10000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
        if (me->query("max_neili") < me->query_neili_limit())
                me->add("max_neili", 1);
	message_vision("$N吃下一粒雪参玉蟾丹，只觉一股浩荡真气直涌"
                       "上来，急忙盘膝而坐，闭目运功...\n" , me);
	destruct(this_object());
	return 1;
}
