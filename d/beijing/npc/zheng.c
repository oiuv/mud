inherit NPC;
#include <ansi.h>
void create()
{
	set_name("郑克爽", ({ "zheng keshuang", "zheng" }));
	set("title", HIC"一等海澄公"NOR);
	set("long", "这是一个弓腰曲背的老头儿，头发花白，容色憔悴不堪，\n"
                   "仔细再看，这人年纪倒也不怎么老，只是愁眉苦脸，眼角\n"
                   "边都是皱纹，颏下留了短须，也已花白，再凝神一看，却\n"
                   "不是郑克爽是谁\n");
	set("gender", "男性");
	set("age", 32);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 50);
	set("int", 40);
	set("con", 40);
	set("per", 40);
	
	set("neili", 300);
	set("max_neili", 300);

	set("combat_exp", 100000);

	set_skill("unarmed", 100);
	set_skill("force", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);

	setup();
	carry_object(__DIR__"obj/goldcloth1")->wear();
}

