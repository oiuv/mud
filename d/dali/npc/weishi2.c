// weishi2.c

inherit NPC;

void create()
{
	set_name("锦衣卫士", ({ "wei shi", "shi", "wei" }));
	set("age", 32);
	set("gender", "男性");
	set("long", "这是位锦衣卫士，身着锦衣，手执钢刀，双目精光炯炯，警惕地巡视着四周的情形。\n");
	set("attitude", "peaceful");

	set("str", 24);
	set("per", 24);
	set("dex", 16);
	set("combat_exp", 30000);
	set("shen_type", 1);

	set_skill("unarmed", 40);
	set_skill("dodge", 100);
	set_skill("parry", 40);
	set_skill("blade", 100);
	set_skill("force", 40);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 40);

	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object(__DIR__"obj/jjunfu")->wear();
}
