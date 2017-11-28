// wudunlu.c

#include <ansi.h>

inherit KNOWER;

void create()
{
	set_name("武敦儒", ({"wu dunru", "wu", "dunru"}));
	set("title", HIY"郭靖大弟子"NOR);
	set("nickname", HIC "消息灵通" NOR);
	set("gender", "男性");
	set("age", 23);
	set("long", "他是郭靖大弟子，相貌和蔼，一天到晚笑呵呵的。\n");
 	set("attitude", "peaceful");
	
	set("per", 24);
	set("str", 20);
	set("int", 20);
	set("con", 30);
	set("dex", 25);

	set("inquiry", ([
		"黄蓉" : "那是我师母。\n",
		"郭靖" : "那是我师父。\n",
	]));

	set("qi", 1000);
	set("max_qi", 1000);
	set("jing", 500);
	set("max_jing", 500);
	set("neili", 1000);
	set("max_neili", 1000);
	
	set("combat_exp", 80000);
	set("score", 20000);
	 
	set_skill("force", 50);
	set_skill("quanzhen-xinfa", 50);
	set_skill("unarmed", 50);
	set_skill("changquan", 50);
	set_skill("dodge", 50);
	set_skill("jinyan-gong", 50);
	set_skill("parry", 50);
	
	map_skill("force", "quanzhen-xinfa");
	map_skill("unarmed", "changquana");
	map_skill("dodge", "jinyan-gong");
	map_skill("parry", "changquana");
	
	setup();
	
	carry_object("/clone/misc/cloth")->wear();
}

