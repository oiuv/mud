// huoji. 药铺伙计

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("药铺伙计", ({ "yaopu huoji", "huoji" }));
	set("str", 20);
	set("gender", "男性");
	set("age", 18);
	set("long", "他十分强壮，看上去会几分武功，对药铺生意似乎并不在乎。\n");
	set("combat_exp", 2500);
	set("attitude", "friendly");
	set("vendor_goods", ({
		"/d/city/obj/jinchuang",
		"/d/city/obj/yangjing",
	}));

	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
