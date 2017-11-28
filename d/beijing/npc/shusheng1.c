inherit NPC;

void create()
{
	set_name("书生", ({ "shu sheng", "shu", "sheng" }) );
	set("gender", "男性" );
	set("age", 22);
	set("long",
		"一个在街上闲逛的少年书生。\n");
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
       carry_object("/d/beijing/npc/obj/cloth1")->wear();
	add_money("coin", 200);
}
