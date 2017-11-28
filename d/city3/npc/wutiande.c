// wutiande.c

#include <ansi.h>

inherit NPC;
void create()
{
	set_name("吴天德", ({ "wu tiande", "wu" }));
	set("title", "成都提督");
	set("shen_type", 0);

	set("gender", "男性");
	set_max_encumbrance(100000000);
	set("age", 35);
	set("long",
		"吴天德大人原来只是一个参将，自从给令狐冲变成小白脸后，居然官运亨通，不但提\n为总兵，还能出督全川之兵。\n");
	set("no_get_from", 1);

	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/attack", 30);
	set_temp("apply/damage", 15);

	set("combat_exp", 50000);
	set("attitude", "friendly");
	
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

