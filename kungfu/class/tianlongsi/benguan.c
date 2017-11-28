// benguan.c

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("本观", ({ "ben guan","guan"}) );
	set("gender", "男性" );
	set("long", "一个枯黄精瘦的僧人，他是本因方丈的师兄。\n");
	set("title", "天龙寺第十七代僧人");
	set("class", "bonze");
	set("age", 47);
	set("shen_type", 1);
	set("str", 26);
	set("int", 25);
	set("con", 22);
	set("dex", 25);

	set("qi", 3000);
	set("max_qi", 3000);
	set("jing", 1500);
	set("max_jing", 1500);
	set("neili", 4100);
	set("max_neili", 4100);
	set("jiali", 50);
	set("combat_exp", 1100000);

	set_skill("force", 210);
	set_skill("dodge", 200);
	set_skill("parry", 200);
	set_skill("finger", 210);
	set_skill("sword", 190);
	set_skill("tiannan-step", 200);
	set_skill("duanshi-xinfa", 200);
	set_skill("duanjia-sword", 190);
	set_skill("sun-finger", 200);
	set_skill("buddhism", 120);
	set_skill("literate", 60);

	set("inquiry" ,([
	        "六脉神剑谱" : "哼！\n",
	        "六脉神剑" :  "哼！\n",
	]));

	map_skill("force", "duanshi-xinfa");
	map_skill("dodge", "tiannan-step");
	map_skill("parry", "sun-finger");
	map_skill("finger", "sun-finger");
	map_skill("sword", "duanjia-sword");
	prepare_skill("finger","sun-finger");
	create_family("大理段家", 15, "高僧");
	setup();
	carry_object("/d/xueshan/obj/b-jiasha")->wear();
}

#include "ben.h"
