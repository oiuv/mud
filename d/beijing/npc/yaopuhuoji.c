inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("药铺伙计", ({ "yaopu huoji", "huoji" }));
	set("str", 20);
	set("gender", "男性");
	set("age", 18);
	set("long", "他十分强壮，看上去会几分武功，对药铺生意似乎并不在乎。\n");
	set("combat_exp", 15000);
	set("attitude", "friendly");
	set("vendor_goods", ({
		"/d/beijing/obj/yao1",
		"/d/beijing/obj/yao2",
		"/d/beijing/obj/yao3",
	}));
	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_skill("parry", 60);

	setup();
	carry_object("/d/beijing/npc/obj/cloth")->wear();
	add_money("silver", 5);
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
