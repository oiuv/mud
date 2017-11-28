// zhang.c
#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
	set_name("张淡月", ({ "zhang danyue", "zhang"}));
	set("title", HIY"神龙教"BLU"黑龙使"NOR);
	set("long", "这是一个黑衣大汉，身躯笔挺，容貌威严。\n" );
	set("gender", "男性");

	set("age", 44);
	set("str", 28);
        set("con", 26);
        set("int", 28);
	set("dex", 24);

	set("max_qi", 3200);
        set("qi", 3200);
	set("max_jing",1600);
	set("neili", 3800); 
	set("max_neili", 3800);
	set("jiali", 60);

	set("combat_exp", 570000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("force", 140);
	set_skill("huntian-qigong", 145);
	set_skill("dodge", 130);
	set_skill("feiyan-zoubi", 130);
	set_skill("unarmed", 130);
	set_skill("changquan", 130);
	set_skill("shedao-qigong", 140);
	set_skill("shenlong-xinfa", 140);
	set_skill("parry", 140);
	set_skill("staff", 140);
	set_skill("literate", 50);

	map_skill("force", "shenlong-xinfa");
	map_skill("dodge", "xiaoyaoyou");
	map_skill("unarmed", "xianglong-zhang");
	map_skill("parry", "xianglong-zhang");

	create_family("神龙教", 0, "长老");

        set("coagents", ({
                ([ "startroom" : "/d/shenlong/dating",
                   "id"        : "hong antong" ]),
        }));

        set("inquiry", ([
		"神龙教" : "一般人是入不了我神龙教的(join shenlongjiao).\n",
		"洪安通" : "教主脾气不好,要讨他欢心才好。\n",
		"教主"   : "教主脾气不好,要讨他欢心才好。\n",
		"入教"   : "一般人是入不了我神龙教的(join shenlongjiao).\n",
		"口号"   : "万年不老！永享仙福！寿与天齐！文武仁圣！\n",
	]));

	setup();
	carry_object("/clone/misc/cloth")->wear();
	add_money("silver", 10);
}

void init()
{
	object ob;

	::init();
	if (! objectp(ob)) return;
	if( interactive(ob = this_player()) && !is_fighting() )
        {
		remove_call_out("greeting");
		call_out("greeting", 2, ob);
	}
}

void greeting(object ob)
{
	object obj;
        if (interactive(ob) && objectp(obj = present("used gao", ob)))
        {
	        set("combat_exp", 100000);
	        set("qi", 1000);
	        set("jing", 1000);
	}
}

void attempt_apprentice(object ob)
{
	command("say 你走开！别烦我！");
	return;
}

