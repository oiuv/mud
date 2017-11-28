// gongweishi.c

inherit NPC;


void create()
{
	set_name("皇宫卫士", ({ "wei shi", "shi" }));
	set("gender", "男性");
	set("age", random(10) + 20);
	set("str", 25);
	set("dex", 16);
	set("long", "这是皇宫的大内卫士，身披钢甲，手执长剑。\n");
	set("combat_exp", 90000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	set_skill("unarmed", 80);
	set_skill("force", 80);
	set_skill("blade", 80);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	set_temp("apply/attack", 50);
	set_temp("apply/defense", 50);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 50);

	set("neili", 1000); 
	set("max_neili", 1000);
	set("jiali", 10);

	setup();
	carry_object("/d/city/npc/obj/tiejia")->wear();
	carry_object("/clone/weapon/changjian")->wield();
}

