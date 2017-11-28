// yuyan.c 

inherit NPC;

void create()
{
	set_name("余人彦", ({ "yu renyan", "yu", "renyan" }));
	set("gender", "男性");
	set("age", 20);
	set("long", "他就是「青城派」掌门人余沧海的独生爱子。可是他实在很不争气。\n");

	set("combat_exp", 40000);
	set("shen_type", -1);

	set_skill("sword", 40);
	set_skill("pixie-sword", 40);
	set_skill("unarmed", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	map_skill("parry", "pixie-sword");
	map_skill("sword", "pixie-sword");
	create_family("青城派", 6, "弟子");
	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/d/wudang/obj/bluecloth")->wear();
}
