// shiwushi.c

inherit NPC;


void create()
{
	set_name("石人武士", ({ "wu shi", "shi" }));
	set("gender", "男性");
	set("age", random(10) + 20);
	set("str", 25);
	set("dex", 16);
	set("long", "这是守护西夏王陵的石人武士。\n");
	set("combat_exp", 30000);
	set("shen_type", 1);
	set("attitude", "aggressive");

	set_skill("unarmed", 80);
	set_skill("force", 80);
	set_skill("club", 80);
	set_skill("zhongping-qiang", 80);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	map_skill("club", "zhongping-qiang");
	set_temp("apply/attack", 50);
	set_temp("apply/defense", 50);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 50);

	set("neili", 1000); 
	set("max_neili", 1000);
	set("jiali", 10);

	setup();
	carry_object("/d/city/npc/obj/tiejia")->wear();
	carry_object("/clone/weapon/changqiang")->wield();
}

