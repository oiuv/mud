inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("茶铺伙计", ({ "chapu huoji", "chapu", "huoji" }) );
	set("gender", "男性" );
	set("age", 18);
	set("long",
		"一个在茶馆里跑堂的伙计。\n");
	set("shen_type", 1);
	set("combat_exp", 10000);
       set("str", 10);
       set("dex", 10);
       set("con", 10);
       set("int", 10);
	set("attitude", "peaceful");
       set_skill("dodge",20);
       set_skill("unarmed",20);
       set("chat_chance", 2);
       set("chat_msg", ({
                "茶铺伙计对着你说道：这位客官，喝茶吗？\n",
        }) );       

	set("vendor_goods", ({
		"/d/beijing/obj/tea1",
		"/d/beijing/obj/tea2",
		"/d/beijing/obj/tea3",
		"/d/beijing/obj/tea4",
	}) );
	setup();
       carry_object("/d/beijing/npc/obj/cloth")->wear();
	add_money("silver", 1);
}
void init()
{
        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}