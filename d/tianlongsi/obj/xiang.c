inherit ITEM;

void init();
int do_dian(string arg);
void create()
{
	set_name("香", ({ "xiang" }) );
	set_weight(30);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "柱");
                set("long", "这是一柱香,你可以点燃它(dian)。\n");
		set("value", 100);
		set("material", "wood");
	}
	setup();
}

void init()
{
	add_action("do_dian", "dian");
}

int do_dian(string arg)
{
	object me;
	string item, target; 

	me = this_player();
	if(!arg||arg!="xiang")
		return notify_fail("你要点燃什么东西？\n");
	else
		{
		if(me->query_temp("marks/ask_temp3"))
			me->set_temp("marks/dian_temp",1);
		return notify_fail("你点燃一柱香拿在手中。\n");
		}		
	return 0;
}
