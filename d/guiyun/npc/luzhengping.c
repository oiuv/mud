// luzhengping.c
#include <ansi.h>

inherit F_UNIQUE;
inherit NPC;

void create()
{
	set_name("吕正平", ({ "lu zhengping", "lu"}));
	set("title", HIC "快刀门掌门人" NOR);
	set("long", "只见他一张国字方脸，腮上一部虬髯，将大半张脸都遮没了。\n");
	set("gender", "男性");
	set("age", 41);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("per", 22);
	set("str", 15);
	set("int", 25);
	set("con", 25);
	set("dex", 30);
	
	set("max_qi", 1000);
	set("max_jing", 200);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 50);
	set("combat_exp", 50000+random(10000));
	set("score", 20000);

	set_skill("force", 50);
	set_skill("dodge", 50);
	set_skill("unarmed", 50);
	set_skill("blade", 50);
	set_skill("kuangfeng-blade", 50);
	set_skill("lingxu-bu",50);
	map_skill("dodge", "lingxu-bu");
	map_skill("parry", "kuangfeng-blade");
	map_skill("blade", "kuangfeng-blade");

	set_temp("apply/attack", 25);
	set_temp("apply/attack", 25);
	set_temp("apply/damage", 25);
	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/misc/cloth")->wear();
}

