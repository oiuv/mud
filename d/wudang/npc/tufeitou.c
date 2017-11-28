// tufeitou.c

inherit NPC;

void create()
{
	set_name("土匪头", ({ "tufei tou","bandit leader","tou" }) );
	set("gender", "男性");
	set("age", 45);
	set("long",
		"这家伙满脸杀气，一付凶神恶煞的模样，令人望而生畏。\n");
	set("combat_exp", 20000);
        set("shen_type", -1);
	set("attitude", "aggressive");

	set("apply/attack",  30);
	set("apply/defense", 30);

	set("chat_chance", 5);
	set("chat_msg", ({
		"土匪头嘿嘿地冷笑着: 今天你就别想从这里活着出去了!\n",
	}) );

	set_skill("sword", 30);
	set_skill("unarmed", 50);
	set_skill("parry", 50);
	set_skill("dodge", 50);

	setup();
        carry_object("/d/city/obj/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
	add_money("silver", 100);
}
