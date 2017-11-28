// mianju.c
// modified by cleansword 1996/2/3

inherit ITEM;

void create()
{
        set_name("面具", ({ "mian ju", "mask" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "个");
		set("long", "这似乎是一个由人皮制成的面具。\n");
		set("no_drop", "这样东西不能离开你。\n");
		set("no_get", "这样东西不能离开那儿。\n");
        }
        setup();
}

void init()
{
	add_action("do_pretend", "pretend");
}

int do_pretend(string arg)
{
	object who;
	if (!arg)
		return notify_fail("你想假装谁？\n");
	if (arg == "none" || arg == "cancel") {
		this_player()->delete_temp("apply/name");
//		this_player()->delete_temp("apply/id");
		this_player()->delete_temp("apply/short");
		this_player()->delete_temp("apply/long");
		message_vision("$N从脸上取下了一个人皮面具。\n", this_player());
		return 1;
	}
	if(!objectp(who = present(arg, environment(this_player()))) || 
		!living(who))
		return notify_fail("你想假装谁？\n");
	write("你开使假装" + who->name() + "。\n");
//	message_vision("$N戴上了一个精功制成的人皮面具。\n", this_player());
	this_player()->set_temp("apply/name", ({who->name()}));
//	this_player()->set_temp("apply/id", ({who->id()}));
	this_player()->set_temp("apply/short", ({who->short()}));
	this_player()->set_temp("apply/long", ({who->long()}));
	return 1;
}
