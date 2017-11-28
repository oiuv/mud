// weishi.c

inherit NPC;

void create()
{
	set_name("素衣卫士", ({ "wei shi", "shi", "wei" }));
	set("age", 32);
	set("gender", "男性");
	set("long", "这是位身怀绝技的武士。\n");
	set("attitude", "peaceful");

	set("str", 24);
	set("per", 20);
	set("dex", 16);
	set("combat_exp", 10000);
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
	carry_object("/d/city/npc/obj/tiejia")->wear();
}
