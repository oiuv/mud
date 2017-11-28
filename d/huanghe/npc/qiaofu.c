// qiaofu.c

inherit NPC;


void create()
{
	set_name("樵夫", ({ "qiao fu","fu" }));
	set("gender", "男性");
	set("age", 52);
	set("str", 25);
	set("dex", 16);
	set("per", 21);
	set("long", "这是一个精壮老汉。\n");
	set("combat_exp", 5000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	setup();
	carry_object(__DIR__"obj/futou")->wield();
	carry_object("/clone/misc/cloth")->wear();
}

