// yilin.c

inherit NPC;

void create()
{
	set_name("仪琳",({ "yi lin", "yi", "lin" }) );
       set("gender", "女性" );
       set("age", 16);
       set("long", "仪琳是恒山派定逸师太的心爱弟子。\n");
	set("combat_exp", 40000);
	set("shen_type", 1);
	set("class", "bonze");
       set("str", 30);
       set("dex", 30);
       set("per", 30);
       set("con", 30);
       set("int", 30);
       set("max_jing", 300);
       set("jing", 300);
       set("max_qi", 600);
       set("qi", 600);
       set_skill("sword", 30);
       set_skill("force", 30);
       set_skill("dodge", 30);
       set_skill("parry", 30);
       set("attitude", "friendly");
	create_family("恒山派", 14, "弟子");
       setup();
       carry_object("clone/cloth/cloth")->wear();
       carry_object("clone/weapon/changjian")->wield();
}

