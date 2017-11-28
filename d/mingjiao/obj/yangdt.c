// yangdt.c

inherit ITEM;
void create()
{
	set_name("阳顶天遗骨", ({ "corpse" }) );
	set_weight(30000);
	set_max_encumbrance(5000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "具" );
		set("long", "这是一具明教前任教主阳顶的遗骨。他英雄一世，现在是什么都不知道了。\n");
		set("no_get", "就让他在这里好好的安息吧。\n");
	}
	setup();
}

