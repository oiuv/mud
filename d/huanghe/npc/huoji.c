// huoji. 药铺伙计

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("伙计", ({ "huoji" }));
	set("str", 20);
	set("gender", "男性");
	set("per", 18);
	set("age", 18);
	set("long", "他是这儿的伙计，正在店里忙里忙外。\n");
	set("combat_exp", 250);
	set("attitude", "friendly");
	set("vendor_goods", ({
		"/d/city/obj/goupi",
		"/d/city/obj/beixin",
		"/clone/misc/gaoyao",
	}));

	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
