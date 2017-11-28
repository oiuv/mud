// peicong.c

inherit NPC;

void create()
{
	set_name("陪从", ({ "pei cong", "cong", "pei" }));
	set("age", 22);
	set("gender", "男性");
	set("long", "一个部族头领的陪从。\n");
	set("attitude", "peaceful");

	set("str", 24);
	set("per", 20);
	set("dex", 16);
	set("combat_exp", 1000);
	set("shen_type", 1);

	set_skill("unarmed", 20);
	set_skill("dodge", 20);
	set_skill("parry", 30);
	set_skill("force", 40);
	set_temp("apply/attack", 10);
	set_temp("apply/defense", 10);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 10);

	setup();
	carry_object("/clone/cloth/cloth")->wear();
}
