// benyin.c

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("本因", ({ "ben yin","yin"}) );
	set("gender", "男性" );
	set("title", "天龙寺第十七代住持");
	set("long", "一个神情潇洒的僧人，他是天龙寺住持方丈。\n");
	set("class", "bonze");
	set("age", 43);
	set("shen_type", 1);
	set("str", 22);
	set("int", 32);
	set("con", 26);
	set("dex", 24);

        set("qi", 3300);
        set("max_qi", 3300);
	set("jing", 1600);
	set("max_jing", 1600);
	set("neili", 4200);
	set("max_neili", 4200);
	set("jiali", 40);
	set("combat_exp", 1200000);

	set_skill("force", 220);
	set_skill("dodge", 220);
	set_skill("parry", 220);
	set_skill("finger", 225);
	set_skill("sword", 200);
	set_skill("tiannan-step", 220);
	set_skill("duanshi-xinfa", 220);
	set_skill("duanjia-sword", 200);
	set_skill("sun-finger", 225);
	set_skill("buddhism", 180);
	set_skill("literate", 120);

	map_skill("force", "duanshi-xinfa");
	map_skill("dodge", "tiannan-step");
	map_skill("parry", "sun-finger");
	map_skill("finger", "sun-finger");
	map_skill("sword", "duanjia-sword");
	prepare_skill("finger","sun-finger");
	set("inquiry" ,([
	        "六脉神剑谱" : "哼！\n",
	        "六脉神剑" :  "哼！\n",
	]));

	create_family("大理段家", 15, "高僧");
	setup();
	carry_object("/d/xueshan/obj/b-jiasha")->wear();
}

#include "ben.h"
