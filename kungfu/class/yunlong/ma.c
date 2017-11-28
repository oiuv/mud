// ma.c 马超兴

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("马超兴", ({ "ma chaoxing", "ma"}));
	set("title", HIR "天地会"HIW"家后堂香主"NOR);
	set("gender", "男性");
	set("long", "\n他就是天地会家后堂香主，矮矮胖胖的个，善使一柄大刀。\n");
	set("class", "fighter");
	set("age", 45);

	set("int", 30);
	set("qi", 1500);
	set("max_qi", 1500);
	set("jing", 500);
	set("max_jing", 500);
	set("shen_type", 1);

	set("combat_exp", 250000);
	set("attitude", "friendly");

	set_skill("force", 80);
	set_skill("unarmed",80);
	set_skill("parry", 80);
	set_skill("dodge", 80);
	set_skill("sword", 70);
	set_skill("blade", 100);
	set_skill("whip", 70);
	set_skill("yunlong-shengong", 70);
	set_skill("yunlong-shenfa", 70);
	set_skill("wuhu-duanmendao", 80);
	set_skill("houquan", 50);
	set_skill("yunlong-jian", 50);
	set_skill("yunlong-bian", 50);
	set_temp("apply/attack", 25);
	set_temp("apply/defense", 25);
	set_temp("apply/damage", 25);

	map_skill("force", "yunlong-shengong");
	map_skill("dodge", "yunlong-shenfa");
	map_skill("parry", "wuhu-duanmendao");
        map_skill("blade","wuhu-duanmendao");
	map_skill("sword", "yunlong-jian");
	map_skill("whip", "yunlong-bian");
        map_skill("unarmed","houquan");

	create_family("云龙门", 2, "弟子");
	set("book_count", 1);
        set("inquiry", ([
		"陈近南" :  "这是我们的总舵主！",
		"天地会" :  "只要是英雄好汉，都可以入我天地会(join tiandihui)。",
		"入会" :  "加入天地会，一同反清复明！",
                "反清复明" : "去药铺和棺材店仔细瞧瞧吧！",
	]));

	set("chat_chance_combat", 50);
	set("chat_msg_combat", ({
		(: command("chat 这位" + RANK_D->query_respect(this_player()) +
		           "，你我无冤无仇，何必如此？") :),
		(: command("unwield changjian") :),
		(: command("wield changjian") :),
		(: command("wield bian") :),
                (: perform_action, "sword.xian" :),
                (: perform_action, "whip.chan" :),
                (: perform_action, "blade.duan" :),
                (: perform_action, "unarmed.zhen" :),
                (: exert_function, "recover" :),
                (: exert_function, "recover" :),
		(: command("unwield bian") :),
		(: command("wield blade") :),
		(: command("unwield blade") :),
        }));

	setup();
	carry_object("/d/shaolin/obj/changbian")->wield();
	carry_object("/clone/weapon/changjian");
	carry_object("/clone/weapon/dadao");
	carry_object("/clone/cloth/cloth")->wear();
        add_money("silver",20);
}

void init()
{
	::init();
	remove_call_out("greeting");
	add_action("do_join", "join");
}

void greeting(object ob)
{
	if (! objectp(ob) || environment(ob) != environment())
		return;

	if (random(5) < 2)
                say("马超兴笑道：这位" + RANK_D->query_respect(ob) +
		    "，可有什么不平之事么？\n");
}



void reset()
{
	set("book_count", 1);
}

#include "/kungfu/class/yunlong/tiandihui.h"
