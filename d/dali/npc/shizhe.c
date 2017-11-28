// shizhe.c

inherit NPC;

void create()
{
	set_name("侍者", ({ "shi zhe", "shi", "zhe" }));
	set("age", 32);
	set("gender", "男性");
	set("long", "他看上去长的眉清目秀。\n");
	set("attitude", "peaceful");

	set("str", 24);
	set("per", 20);
	set("dex", 16);
	set("combat_exp", 10000);
	set("shen_type", 1);

	set_skill("unarmed", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	set_skill("staff", 40);
	set_skill("force", 40);
	set_temp("apply/attack", 40);
	set_temp("apply/defense", 40);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 40);

	setup();
	carry_object("/clone/weapon/gangzhang")->wield();
	carry_object("/clone/cloth/cloth")->wear();
}
