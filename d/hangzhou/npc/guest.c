// guest.c 进香客

inherit NPC;

void create()
{
	int age;
	age = 20 + random(40);
	
	set_name("进香客", ({ "jinxiang ke", "ke", "guest" }));
	set("gender", "男性");
	set("age", age);

	set_skill("unarmed", 20);
	set_skill("dodge", 20);
	set("apply/attack", 15);
	set("apply/defense", 15);
	set("apply/damage", 5);
	set("combat_exp", 150+age*10);
	set("shen_type", 1);
	setup();
	add_money("silver", 3+age/10);
}
	
