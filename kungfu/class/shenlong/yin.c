// yin.c
#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_MASTER;

void create()
{
	set_name("殷锦", ({ "yin jin", "yin"}));
	set("title", HIY"神龙教"YEL"黄龙使"NOR);
	set("long", "这是个汉子, 一脸奸相, 明显是个小人.\n" );
	set("gender", "男性");
	set("age", 44);
	set("str", 22);
        set("int", 29);
        set("con", 26);
	set("dex", 24);

	set("max_qi", 2900);
        set("qi", 2900);
	set("max_jing", 1500);
        set("jing", 1500);
	set("neili", 3500); 
	set("max_neili", 3500);
	set("jiali", 50);
	set("combat_exp", 370000);
	set("shen_type", -1);
	set("attitude", "peaceful");

	set_skill("force", 130);
	set_skill("dodge", 120);
	set_skill("strike", 110);
	set_skill("claw", 110);
	set_skill("parry", 120);
	set_skill("staff", 110);
	set_skill("literate", 50);
	set_skill("huagong-dafa", 130);
	set_skill("zhaixinggong", 120);
	set_skill("chousui-zhang", 110);
	set_skill("sanyin-wugongzhao", 110);
	set_skill("shenlong-xinfa", 100);
	set_skill("shedao-qigong", 100);

	map_skill("force", "huagong-dafa");
	map_skill("dodge", "zhaixinggong");
	map_skill("claw", "sanyin-wugongzhao");
	map_skill("strike", "chousui-zhang");
	map_skill("parry", "chousui-zhang");
	prepare_skill("claw", "sanyin-wugongzhao");
	prepare_skill("strike", "chousui-zhang");

	create_family("神龙教", 0, "长老");

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
	if (interactive(ob = this_player()) && !is_fighting())
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
	   	set("qi",100);
	   	set("jing",100);
	}
}

void attempt_apprentice(object ob)
{
	command("say 除了文武仁圣的洪教主，谁有资格收徒？");
	return;
}

