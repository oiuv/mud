// tufei2.c

inherit NPC;

void create()
{
	set_name("土匪", ({ "tufei","bandit","fei" }) );
	set("gender", "男性");
	set("age", 20);
	set("long",
		"这家伙满脸横肉一付凶神恶煞的模样，令人望而生畏。\n");
	set("combat_exp", 5000);
        set("shen_type", -1);
	set("attitude", "aggressive");

	set("apply/attack", 10);
	set("apply/defense", 10);

	set_skill("unarmed", 25);
	set_skill("parry", 20);
	set_skill("dodge", 20);

	setup();
        carry_object("/clone/misc/cloth")->wear();
	add_money("silver", 10);
}
