// seller.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("小贩", ({ "seller" }) );
	set("gender", "男性" );
	set("age", 32);
	set("long",
		"这位小贩子正笑咪咪地来回忙著，还不时招呼过往的客人进来。\n");
	set("combat_exp", 300);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	set("vendor_goods", ({
		"/d/shaolin/obj/hulu",
		"/d/city/obj/zhubang",
                "/d/village/obj/zhujian",
                "/d/xingxiu/obj/fire",
	}) );
	setup();
        carry_object("/clone/cloth/cloth")->wear();
	add_money("coin", 100);
}
void init()
{
	object ob;
        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");
	if( interactive(ob = this_player()) && !is_fighting() ) {
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}
}

void greeting(object ob)
{
	if( !ob || environment(ob) != environment() ) return;
	say( "小贩子笑呵呵说道：这位" + RANK_D->query_respect(ob) + "，您想要点什么？\n");
	return;
}

