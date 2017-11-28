//shiye.c

inherit NPC;

void create()
{
	set_name("陈继盛", ({ "chen jisheng", "chen" }));
	set("title", "知府师爷");
	set("gender", "男性");
	set("age", 60);
	set("combat_exp", 40000);
	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack",  20);
	set_temp("apply/defense", 20);
	set_temp("apply/damage",  20);
	set("shen_type", 0);
	
	setup();
	carry_object(__DIR__"obj/choupao")->wear();
}
