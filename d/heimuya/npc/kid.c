//kid.c
inherit NPC;

void create()
{
	set_name("小孩",({ "kid" }) );
	set("gender", "男性" );
	set("age", 6);
	set("long", "这是个农家小孩子\n");
	set("combat_exp", 50);
	set("shen_type", 0);
	set("str", 10);
	set("dex", 10);
	set("con", 10);
	set("int", 10);
	set("attitude", "friendly");
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

