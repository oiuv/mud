// poyi.c

inherit NPC;

void create()
{
	set_name("破疑", ({ "po yi", "yi" }));
	set("age", 22);
	set("gender", "男性");
	set("long", "他是一个和尚，是黄眉大师的大弟子。\n");
	set("attitude", "peaceful");

	set("str", 24);
	set("per", 20);
	set("dex", 26);
	set("combat_exp", 60000);
	set("shen_type", 1);
	set("class", "bonze");

	set_skill("unarmed", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	set_skill("force", 40);
	set_temp("apply/attack", 60);
	set_temp("apply/defense", 60);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 60);

	setup();
	carry_object("/d/shaolin/obj/dao-cloth")->wear();
}

