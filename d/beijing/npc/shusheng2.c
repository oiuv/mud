inherit NPC;

void create()
{
	set_name("酸秀才", ({ "xiu cai", "xiu", "cai" }) );
	set("gender", "男性" );
	set("age", 28);
	set("long",
		"一个邋遢的秀才，没什么学问却自问学士渊博。\n");
	set("shen_type", 1);
	set("combat_exp", 10000);
       set("str", 10);
       set("dex", 10);
       set("con", 10);
       set("int", 10);
	set("attitude", "peaceful");
       set_skill("dodge",20);
       set_skill("unarmed",20);

	setup();
       carry_object("/d/beijing/npc/obj/cloth2")->wear();
	add_money("coin", 200);
}
