// jiading.c 家丁

inherit NPC;

void create()
{
	set_name("家丁", ({ "jia ding", "jia" }));
	set("gender", "男性");
	set("age", 35);
	set("long", "佛山凤老爷府上的家丁。占势欺人，横行霸道。\n");
	set("combat_exp", 4000);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_temp("apply/attack",  10);
        set_temp("apply/defense", 10);
	set("shen_type", -1);
	setup();

	add_money("silver",3);
	carry_object("/clone/misc/cloth")->wear();
}
