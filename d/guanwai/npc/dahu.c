// dahu.c

inherit NPC;

void create()
{
	set_name("忽伦大虎", ({ "da hu" }));
	set("gender", "男性");
	set("nickname", "巨人");
	set("age", 19);
	set("long", "他是一个满洲巨人，手脚粗大，善于相扑，却生性纯朴。\n");
	
	set("combat_exp", 100000);
	set("shen_type", 0);

	set("attitude", "peaceful");
	
	set_skill("unarmed", 90);
	set_skill("dodge", 90);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);

	setup();
	carry_object("/clone/misc/cloth")->wear();
	add_money("silver",2);
}
