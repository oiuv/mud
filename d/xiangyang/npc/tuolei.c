// tuolei.c

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("拖雷", ({ "tuo lei", "lei", "tuo" }));
	set("long", 
"拖雷是成吉思汗幼子，坚忍果决。此次带兵南来，势如破竹，兵锋毕露。\n");
	set("gender", "男性");
	set("age", 18);
	set("attitude", "friendly");
	set("shen_type", 1);
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

	set("env/wimpy", 60);
	set_temp("is_riding", HIC"青骢马"NOR);
	set("env/wimpy", 40);

 	setup();
	carry_object("/d/city/obj/tiejia")->wear();
}

