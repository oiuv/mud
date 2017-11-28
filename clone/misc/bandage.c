// bandage.c

inherit ITEM;
inherit F_EQUIP;

void create()
{
	set_name("布条", ({ "cloth piece", "cloth", "piece" }) );
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "条");
		set("material", "cloth");
		set("armor_type", "bandage");
		set("armor_prop/attack", -10);
		set("armor_prop/defense", -10);
		set("armor_prop/unarmed", -10);
	}
}

void init()
{
	add_action("do_bandage", "bandage");
}

int wear() { return 0; }

int do_bandage(string arg)
{
	object ob;

	if( (int)query("blood_soaked") >= 2 )
		return notify_fail( name() + "已经被鲜血浸透，不能再用了。\n");

	if( query("equipped") )
		return notify_fail( name() + "已经裹在你的伤口上了，如果你要用来包扎别人，请你先把它除下来。\n");

	if( !arg ) ob = this_player();
	else {
		ob = present(arg, environment(this_player()));
		if( !ob || !userp(ob))
			return notify_fail("你要替谁裹伤？\n");
	}

	if( this_player()->is_fighting()
	||	ob->is_fighting() )
		return notify_fail("战斗中不能裹伤。\n");

	if( (int)ob->query("eff_qi") == (int)ob->query("max_qi") )
		return notify_fail( (ob==this_player()? "你" : ob->name())
			+ "并没有受到任何外伤。\n");

	if( ob->query_temp("armor/bandage") )
		return notify_fail( ob->name() + "身上的伤已经裹著其他东西了。\n");

	if( !move(ob) ) return 0;

	if( ob==this_player() )
		message_vision("$N用" + name() + "替自己裹伤。\n", this_player());
	else
		message_vision("$N用" + name() + "替$n裹伤。\n", this_player(), ob);

	::wear();
	ob->apply_condition("bandaged", 40);
	add("blood_soaked", 1);

	return 1;
}

void remove(string euid)
{
	::remove(euid);
	if( query("equipped") && environment() )
		environment()->apply_condition("bandaged", 0);
}

string query_autoload()
{
	if( query("equipped") ) return query("name");
}

void autoload(string arg)
{
	int i;

	set("name", arg);
	set("blood_soaked", 3);
	::wear();
}

