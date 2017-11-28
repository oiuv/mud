// youke.c 游客

inherit NPC;

void create()
{
	set_name("游客", ({ "youke" }));
	set("gender", "男性");
	set("age", 20 + random(30));
	set("long", "一个远道来的汉族游客，风尘仆仆，但显然为眼前美景所动，兴高彩烈。\n");
	set_skill("unarmed", 20);
	set_skill("dodge", 20);
	set("apply/attack", 15);
	set("apply/defense", 15);
	set("apply/damage", 5);
	set("combat_exp", 750);
	set("shen_type", 1);
	setup();
	carry_object("/clone/cloth/cloth")->wear();
	add_money("silver", 5);
}
	
