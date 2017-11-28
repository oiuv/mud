#include <ansi.h>

inherit NPC;

void create()
{
	set_name("唐钝", ({"tang dun"}));
	set("title","唐门长房弟子");
	set("long",
	"这是一个唐门长房弟子，一袭青衣，浑身透着一股邪气。本月长房轮值。\n"
	);

	set("gender", "男性");
	set("attitude", "peaceful");

	set("age", 10+random(10));
	set("shen_type", -1);
	set("str", 25+random(10));
	set("dex", 25+random(10));
	set("max_qi", 200);
	set("max_jing", 150);
	set("neili", 200);
	set("max_neili", 200);
	set("jiaji", 5+random(5));
	set("combat_exp", 20000+random(10000));

	set_skill("force", 40);
	set_skill("dodge", 40);
	set_skill("unarmed", 40);
	set_skill("parry", 40);
	set_skill("sword", 60);
	set_skill("shedao-qigong", 30);
	map_skill("sword","shedao-qigong");
		set("chat_chance", 3);
        set("chat_msg", ({
            "唐钝面无表情地说道: 江湖中无人敢侵犯唐门! \n",
        }) );

	setup();
}
