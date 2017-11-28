#include <ansi.h>
inherit NPC;

void create()
{
	set_name("小青", ({ "xiao qing", "xiao", "qing" }));
	set("title", "白骆山庄药师");
	set("gender", "女性" );
	set("age", 17);
	set("long", "这是个打扮很朴素小姑娘，一袭青衣，却也显得落落有致。\n");
	set("attitude", "friendly");
	set("shen_type", -1);

	set("str", 20);
	set("int", 29);
	set("con", 23);
	set("dex", 22);

	set("max_qi", 430);
	set("max_jing", 220);
	set("neili", 320);
	set("max_neili", 320);

	set("combat_exp", 60000);
	set("score", 1000);

	set_skill("force", 40);
	set_skill("dodge", 50);
	set_skill("unarmed", 35);
	set_skill("parry", 40);
	set_temp("apply/attack", 10);
	set_temp("apply/defense", 15);
	set_temp("apply/damage", 17);
	set_temp("apply/armor", 10);

	set_temp("dan",0);
	set_temp("times",5);

        set("inquiry", ([
	    	"海口大碗" : "这海口大碗你可以拿到顶东头小院儿去，灌水喝。",
	    	"药罐"     : "药罐在那儿，你自己看吧。",
	]));

	setup();
	carry_object("/d/baituo/obj/qingpao")->wear();
}
