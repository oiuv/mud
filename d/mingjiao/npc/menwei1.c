// menwei1.c

inherit NPC;
//string inquiry_dao();
inherit F_GUARDER;

void create()
{
	set_name("大汉", ({ "da han","han" }) );
	set("gender", "男性" );

	set("age", 35);
	set("long", "明教的守门武士，是烈火旗属下。\n");
	set("shen_type",1);
	set("combat_exp", 20000);

	set("attitude", "peaceful");

	set("apply/attack", 150);
	set("apply/defense", 150);


	set_skill("unarmed", 150);
//	set_skill("blade", 120);
	set_skill("parry", 140);
	set_skill("dodge", 150);

	set("coagents", ({
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "zhang wuji" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "fan yao" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "yang xiao" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "xie xun" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "yin tianzheng" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "wei yixiao" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "dai jisi" ]),
        }));

	setup();
	carry_object("/clone/misc/cloth")->wear();
//      carry_object("/d/mingjiao/obj/mutang")->wield();
}

void unconcious()
{
        die();
}