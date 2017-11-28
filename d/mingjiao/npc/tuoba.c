// TuoBa.c
// pal 1997.05.14

#include "ansi.h"

inherit NPC;
inherit F_GUARDER;
inherit F_UNIQUE;

void create()
{
        set_name("拓跋", ({ "tuoba", }));
	set("long",
        "他是一位带发修行的头陀，身穿一件白布长袍。\n"
        "他个子不高，但很结实，看上去颇为纯朴。可是脸上经常浮现出奇怪的笑容，让\n"
        "人有些摸不着头脑。\n"
	);

	set("title",HIR "明教" NOR "风字门门主");
	set("level",5);

	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 22);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 450);
	set("max_jing", 300);
	set("neili", 600);
	set("max_neili", 600);
	set("jiali", 50);
	set("combat_exp", 50000);
	set("score", 100);

	set_skill("force", 70);
	set_skill("hunyuan-yiqi", 70);
	set_skill("dodge", 70);
	set_skill("shaolin-shenfa", 70);
	set_skill("finger", 68);
	set_skill("nianhua-zhi", 68);
	set_skill("parry", 70);
	set_skill("sword", 80);
	set_skill("damo-jian", 80);
	set_skill("buddhism", 70);
	set_skill("literate", 70);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("finger", "nianhua-zhi");
	map_skill("parry", "damo-jian");
	map_skill("sword", "damo-jian");

	prepare_skill("finger", "nianhua-zhi");

	set("coagents", ({
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "zhang wuji" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "fan yao" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "yang xiao" ]),
        }));
	setup();

        carry_object("/d/mingjiao/obj/baipao")->wear();
}

void unconcious()
{
        die();
}

