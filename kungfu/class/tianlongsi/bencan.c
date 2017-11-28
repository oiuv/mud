// bencan.c

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("本参", ({ "ben can","can"}) );
	set("gender", "男性" );
	set("long", "他身材魁伟，为本因方丈的师兄。\n" );
	set("title", "天龙寺第十七代僧人");
	set("class", "bonze");
	set("age", 49);
	set("shen_type", 1);
	set("str", 25);
	set("int", 24);
	set("con", 22);
	set("dex", 23);

	set("qi", 3200);
	set("max_qi", 3200);
	set("jing", 1600);
	set("max_jing", 1600);
	set("neili", 4500);
	set("max_neili", 4500);
	set("jiali", 50);
	set("combat_exp", 1250000);

	set_skill("force", 220);
	set_skill("dodge", 210);
	set_skill("parry", 210);
	set_skill("finger", 220);
	set_skill("sword", 210);
	set_skill("tiannan-step", 210);
	set_skill("duanshi-xinfa", 220);
	set_skill("duanjia-sword", 210);
	set_skill("sun-finger", 220);
	set_skill("buddhism", 140);
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
