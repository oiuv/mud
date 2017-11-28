// shi.c

inherit NPC;

void create()
{
	set_name("Ê·ïÚÍ·", ({ "shi biaotou", "shi" }));
	set("gender", "ÄĞĞÔ");
	set("age", 45);

	set("combat_exp", 7000);
	set("shen_type", 1);

	set_skill("unarmed", 30);
	set_skill("blade", 40);
	set_skill("parry", 30);
	set_skill("dodge", 30);
	
	set_temp("apply/attack", 20);
	set_temp("apply/defense", 20);
	set_temp("apply/damage", 20);

	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/cloth/cloth")->wear();
}
