// zhang3.c

#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_MASTER;
int do_skills(string arg);
int do_join(string arg);

void create()
{
	set_name("章老三", ({ "zhang laosan", "zhang" }));
	set("title", HIY"神龙教"NOR"小头目");
	set("gender", "男性");
	set("age", 44);
	set("str", 25);
	set("dex", 20);
	set("long", "这是一个干瘦老头，一双小眼睛贼闪发光。\n");
	set("combat_exp", 25000);
	set("score", 2000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("force", 50);
	set_skill("unarmed", 70);
	set_skill("dodge", 70);
	set_skill("parry", 70);
	set_skill("yixingbu", 40);
	set_skill("shenlong-bashi", 50);
	map_skill("parry", "shenlong-bashi");
	map_skill("dodge", "yixingbu");

	set_temp("apply/attack", 15);
	set_temp("apply/defense", 15);
	set_temp("apply/armor", 10);
	set_temp("apply/damage", 10);
	set("neili", 500); 
	set("max_neili", 500);
	set("jiali", 10);
	set("inquiry", ([
		"神龙教" : "一般人是入不了我神龙教的(join shenlongjiao)。",
		"入教"   : "一般人是入不了我神龙教的(join shenlongjiao)。",
		"洪安通" : "教主脾气不好，要讨他欢心才好。",
		"教主"   : "教主脾气不好，要讨他欢心才好。",
		"口号"   : "万年不老！永享仙福！寿与天齐！文武仁圣！",
	]));
	set("chat_msg", ({
"章老三高声叫道：教主宝训，时刻在心，建功克敌，无事不成！\n",
"章老三高声叫道：众志齐心可成城，威震天下无比伦！\n",
"章老三高声叫道：神龙飞天齐仰望，教主声威盖八方！\n",
"章老三高声叫道：乘风破浪逞英豪，教主如同日月光！\n",
"章老三高声叫道：教主永享仙福，寿与天齐！\n",
	}) );
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
	add_action("do_join", "join");
}

#include "/kungfu/class/shenlong/shenlong.h"
