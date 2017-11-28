inherit NPC;

void create()
{
	set_name("鳌府侍卫", ({ "shi wei", "shi", "wei" }));
	set("age", 22);
	set("gender", "男性");
	set("long", "一个身材彪旱的官兵，提着刀守卫着鳌拜府。\n");
	set("attitude", "peaceful");

	set("str", 25);
	set("dex", 20);
	set("combat_exp", 20000);
	set("shen_type", 1);

	set_skill("unarmed", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	set_skill("blade", 40);
	set_skill("force", 40);
	set_temp("apply/attack", 20);
	set_temp("apply/defense", 20);
	set_temp("apply/damage", 10);
	set_temp("apply/armor", 20);

	setup();
	carry_object("/d/beijing/npc/obj/blade1")->wield();
       carry_object("/d/beijing/npc/obj/guanfu6")->wear();
}

void unconcious()
{
        die();
}
