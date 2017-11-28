// hou.c

inherit NPC;
#include <ansi.h>;
void create()
{
	set_name("侯通海", ({ "hou tonghai", "hou", "tonghai" }));
	set("gender", "男性");
	set("nickname", HIC"三头蛟"NOR);
	set("age", 43);
	set("str", 25);
	set("dex", 16);
	set("per", 11);
	set("long", "侯通海是个青脸瘦子，面颊极长，额角上肿起了三个大肉瘤，非
常难看。\n");
	set("combat_exp", 100000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("unarmed", 60);
	set_skill("force", 60);
	set_skill("club", 60);
	set_skill("dodge", 60);
	set_skill("parry", 60);
	set_temp("apply/attack", 50);
	set_temp("apply/defense", 50);
	set_temp("apply/armor", 50);
	set_temp("apply/damage", 30);

	set("neili", 400); 
	set("max_neili", 400);
	set("jiali", 10);

	setup();
	carry_object(__DIR__"obj/fork")->wield();
	carry_object("/clone/misc/cloth")->wear();
}

