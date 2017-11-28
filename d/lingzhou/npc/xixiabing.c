// xixiabing.c

inherit NPC;


void create()
{
	set_name("西夏兵", ({ "xixia bing", "bing" }));
	set("gender", "男性");
	set("age", random(10) + 20);
	set("str", 25);
	set("dex", 16);
	set("long", "这是名魁武的西夏兵，身披钢甲，手执长枪。\n");
	set("combat_exp", 12000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	set_skill("unarmed", 30);
	set_skill("force", 30);
	set_skill("club", 30);
	set_skill("dodge", 30);
	set_skill("parry", 30);
	set_temp("apply/attack", 20);
	set_temp("apply/defense", 20);
	set_temp("apply/armor", 20);
	set_temp("apply/damage", 20);

	set("neili", 100); 
	set("max_neili", 100);
	set("jiali", 10);

	setup();
	carry_object("/clone/weapon/changqiang")->wield();
	carry_object("/d/city/npc/obj/tiejia")->wear();
}

