// wugeng.c

#include <ansi.h>

inherit NPC;
inherit F_GUARDER;

void create()
{
	set_name("无根道长", ( { "wugen daozhang", "wugen","daozhang" }) );
	set("title", HIY"神龙教"HIR"赤龙使"NOR);
	set("gender", "男性" );
	set("age", 55);
	set("long", "这是个五十来岁的黑须道长，相貌威武，眼中略带杀气。\n");

	set("str", 30);
	set("int", 25);
	set("con", 28);
	set("dex", 26);

	set("qi", 3800);
	set("max_qi", 3800);
	set("jing", 1900);
	set("max_jing", 1900);
	set("neili", 4200);
	set("max_neili", 4200);
	set("jiali", 60);
	set("combat_exp", 720000);
        set("shen_type", -1);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 120);
	set_temp("apply/damage", 120);

	set_skill("strike", 160);
	set_skill("force", 170);
	set_skill("dodge", 160);
	set_skill("parry", 170);
	set_skill("sword", 170);
	set_skill("staff", 150);
	set_skill("literate", 80);
	set_skill("huashan-zhangfa", 160);
	set_skill("huashan-shenfa", 160);
	set_skill("huashan-jian", 170);
	set_skill("zixia-shengong", 170);
	set_skill("shenlong-xinfa", 170);
	set_skill("shedao-qigong", 170);

	map_skill("force", "zixia-shengong");
	map_skill("strike", "huashan-zhangfa");
	map_skill("dodge", "huashan-shenfa");
	map_skill("parry", "huashan-jian");
	map_skill("sword", "huashan-jian");

        prepare_skill("strike", "huashan-zhangfa");

	create_family("神龙教", 0, "长老");

	set("inquiry", ([
		"神龙教" : "一般人是入不了我神龙教的(join shenlongjiao).\n",
		"洪安通" : "教主脾气不好,要讨他欢心才好。\n",
		"教主"   : "教主脾气不好,要讨他欢心才好。\n",
		"入教"   : "一般人是入不了我神龙教的(join shenlongjiao).\n",
		"口号"   : "万年不老！永享仙福！寿与天齐！文武仁圣！\n",
	]));

        set("coagents", ({
                ([ "startroom" : "/d/shenlong/dating",
                   "id"        : "hong antong", ]),
        }));

	setup();
        carry_object("/d/city/obj/duanjian")->wield();
	add_money("silver",10);
}

void init()
{
	object ob;

	::init();
	if (! objectp(ob)) return;
	if (interactive(ob = this_player()) && !is_fighting())
	{
		remove_call_out("greeting");
		call_out("greeting", 3, ob);
	}
}

void greeting(object ob)
{
	object obj;
        if (interactive(ob) && objectp(obj = present("used gao", ob)))
        {
	   set("combat_exp",100000);
	   set("qi",100);
	   set("jing",100);
	}
}

void attempt_apprentice(object ob)
{
        command("say 贫道不收徒！");
	return;
}

