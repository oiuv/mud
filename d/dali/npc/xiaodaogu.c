// xiaodaogu.c

inherit NPC;

void create()
{
	set_name("小道姑", ({ "xiao daogu", "daogu" }));
	set("long","玉虚观的小道姑，她是在这接待香客的。\n");
	set("gender", "女性");
	set("age", 16);
	set("attitude", "peaceful");
	set("shen_type", 1);
        set("class", "taoist");

	set("per", 20);
	set("str", 20);
	set("int", 20);
	set("con", 22);
	set("dex", 25);
	
	set("max_qi", 150);
	set("max_jing", 100);
	set("neili", 150);
	set("max_neili", 150);

	set("combat_exp", 2000);
	set("score", 1000);

	set_skill("force", 30);
	set_skill("dodge", 20);
	set_skill("unarmed", 20);
	set_skill("parry", 20);
	set_temp("apply/attack", 15);
	set_temp("apply/defense", 15);
	set_temp("apply/damage", 5);

	setup();
	
	carry_object(__DIR__"obj/cynrobe")->wear();
}
