// menggubing.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("ÃÉ¹Å±ø", ({ "menggu bing", "bing", "menggu" }));
	set("long", "ÃÉ¹Å±ø³¤ÄêÔ¾ÂíºáÇ¹£¬Ê®·ÖæçÓÂ¡£\n");
	set("gender", "ÄÐÐÔ");
	set("age", 18);
	set("attitude", "friendly");
	set("shen_type", -1);
	set("per", 24);
	set("str", 20);
	set("int", 40);
	set("con", 20);
	set("dex", 20);
	
	set("max_qi", 800);
	set("max_jing", 800);
	set("neili", 100);
	set("max_neili", 100);
	set("combat_exp", 60000);

	set_skill("force", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	set_skill("unarmed", 40);
	set_skill("club", 40);
	set_skill("zhongping-qiang", 40);
	map_skill("club", "zhongping-qiang");

	set("env/wimpy", 60);
	set_temp("is_riding", HIY "ÃÉ¹ÅÂí" NOR);
	set("env/wimpy", 40);

 	setup();
	carry_object("/d/city/obj/tiejia")->wear();
	carry_object("/clone/weapon/changqiang")->wield();
}
