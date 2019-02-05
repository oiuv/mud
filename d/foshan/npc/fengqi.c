// fengqi.c
#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
	set_name("凤七", ({ "feng qi", "feng", "qi" }) );
	set("gender", "男性" );
	set("title", "酒楼老板" );
	set("nickname", HIC "消息灵通" NOR);
	set("age", 42);
	set("long", @LONG
凤七是凤天南的远房祖弟，在这英雄楼当掌柜。武功没有什么，为人
却极是机灵，江湖上大大小小的事情都知道一些
LONG );
	set("combat_exp", 10000);
	set("attitude", "friendly");
	set("rank_info/respect", "七哥");
	set("vendor_goods", ({
		"/clone/food/jitui",
		"/clone/food/jiudai",
		"/clone/food/baozi",
	}));
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
	object ob;
//	mapping myfam;

	ob = this_player();

	::init();
	if (interactive(ob) && ! is_fighting())
        {
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}

	add_action("do_buy", "buy");
	add_action("do_list", "list");
}

void greeting(object ob)
{
	if (! ob || environment(ob) != environment()) return;
	switch (random(2))
        {
		case 0:
			say( "凤七笑咪咪地说道：这位" + RANK_D->query_respect(ob)
				+ "，进来喝杯茶，歇歇腿吧。\n");
			break;
		case 1:
			say( "凤七笑咪咪地说道：这位" + RANK_D->query_respect(ob)
				+ "，快请进。\n");
			break;
	}
}

void unconcious()
{
        die();
}
