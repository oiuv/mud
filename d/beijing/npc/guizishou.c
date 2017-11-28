inherit NPC;

void create()
{
	set_name("刽子手", ({ "guizi shou", "guizi", "shou" }));
	set("long", 
		"一个身材剽悍的男子，手里提着柄钢刀。\n"
              "在刑场中专门负责屠人。\n");
	set("gender", "男性");
	set("age", 30);
	set("attitude", "heroism");
	set("shen_type", 1);

	set("str", 30);
	set("int", 20);
	set("con", 25);
	set("dex", 20);
	
	set("max_qi", 150);
	set("max_jing", 150);
	set("neili", 100);
	set("max_neili", 100);

	set("combat_exp", 15000);

	set_skill("force", 20);
	set_skill("dodge", 20);
	set_skill("unarmed", 20);
	set_skill("parry", 20);
	set_skill("blade", 20);

	setup();
	carry_object("/d/beijing/npc/obj/blade1")->wield();
       carry_object("/d/beijing/npc/obj/cloth")->wear();
}
