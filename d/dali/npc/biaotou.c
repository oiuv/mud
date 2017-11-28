// biaotou.c 

inherit NPC;

void create()
{
	set_name("「平通镖局」镖头", ({ "biao tou", "biao" }));
	set("gender", "男性");
	set("age", 35);

	set("combat_exp", 5000);
	set("shen_type", 1);

	set_skill("unarmed", 30);
	set_skill("blade", 40);
	set_skill("parry", 30);
	set_skill("dodge", 30);
	
	set_temp("apply/attack", 15);
	set_temp("apply/defense", 15);
	set_temp("apply/damage", 20);

	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/cloth/cloth")->wear();
}
	
