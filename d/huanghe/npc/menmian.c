// menmian.c

inherit NPC;


void create()
{
	set_name("蒙面人", ({ "menmian ren", "menmian", "ren" }));
	set("gender", "男性");
	set("age", random(10) + 40);
	set("str", 25);
	set("dex", 16);
	set("per", 20);
	set("long", "一个黑布蒙面，神秘兮兮的家伙。\n");
	set("combat_exp", 20000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 30);
	set_skill("force", 30);
	set_skill("dagger", 30);
	set_skill("dodge", 30);
	set_skill("parry", 30);
	set_temp("apply/attack", 30);
	set_temp("apply/defense", 30);
	set_temp("apply/armor", 30);
	set_temp("apply/damage", 20);

	set("neili", 400); 
	set("max_neili", 400);
	set("jiali", 10);

	setup();
	carry_object(__DIR__"obj/fenshuici")->wield();
	carry_object(__DIR__"obj/shuikao")->wear();
}

