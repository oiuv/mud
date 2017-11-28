// xuanzhen.c 玄贞道长

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("玄贞道长", ({ "xuan zhen", "xuan", "zhen" }));
	set("gender", "男性");
	set("title", HIR "天地会"HIG"青木堂"NOR"会众");
	set("long", "\n这位沉默寡言的道人，便是天地会青木堂护法。\n"+
		"他是青木堂数一数二的好手，一柄长剑使得出神入化。\n");
	set("age", 55);
	set("class", "taoist");
	set("int", 30);
	
	set("qi", 2800);
	set("max_qi", 2800);
	set("jing", 1200);
	set("max_jing", 1200);
	set("shen_type", 1);

	set("combat_exp", 100000);
	set("attitude", "friendly");

	set_skill("force", 80);
	set_skill("unarmed", 80);
	set_skill("parry", 80);
	set_skill("dodge", 80);
	set_skill("sword", 100);
	set_skill("whip", 80);
	set_skill("hand", 70);
	set_skill("claw", 70);
	set_skill("yunlong-shengong", 70);
	set_skill("yunlong-shenfa", 70);
	set_skill("yunlong-xinfa", 70);
	set_skill("yunlong-bian", 70);
	set_skill("yunlong-jian", 80);
	set_skill("yunlong-shou", 50);
	set_skill("yunlong-zhua", 50);
	set_temp("apply/attack", 70);
	set_temp("apply/defense", 70);
	set_temp("apply/damage", 60);

	map_skill("force", "yunlong-shengong");
	map_skill("dodge", "yunlong-shenfa");
	map_skill("parry", "yunlong-jian");
	map_skill("sword", "yunlong-jian");
	map_skill("hand", "yunlong-shou");
	map_skill("claw", "yunlong-zhua");
	map_skill("whip", "yunlong-bian");

	prepare_skill("hand", "yunlong-shou");
	prepare_skill("claw", "yunlong-zhua");
	create_family("云龙门",2, "弟子");
	set("book_count", 1);

        set("inquiry", ([
		"陈近南" : "想见总舵主可不容易啊。",
		"天地会" : "只要是英雄好汉，都可以入我天地会。",
                "反清复明" : "去棺材店和回春堂仔细瞧瞧吧！",
                "暗号" : "敲三下！",
                "切口" : "敲三下！",
        ]));

	set("chat_chance_combat", 50);  
	set("chat_msg_combat", ({
		(: command("smile") :),
		(: command("haha") :),
		(: command("chat 这位" + RANK_D->query_respect(this_player())+",你我无冤无仇，何必如此?\n") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("unwield changjian") :),
		(: command("wield changjian") :),
		(: command("wield changjian") :),
		(: command("wield changjian") :),
		(: command("wield changjian") :),
		(: command("wield changjian") :),
		(: command("wield changjian") :),
		(: command("wield bian") :),
		(: command("wield bian") :),
		(: command("wield bian") :),
		(: command("wield bian") :),
                (: perform_action, "sword.xian" :),
                (: perform_action, "sword.xian" :),
                (: perform_action, "sword.xian" :),
                (: perform_action, "whip.chan" :),
                (: perform_action, "whip.chan" :),
                (: exert_function, "recover" :),
                (: exert_function, "recover" :),
		(: command("unwield bian") :),
		(: command("unwield bian") :),
		(: command("unwield bian") :),
		(: command("unwield bian") :),
                      }) );
	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 12);
}

void init()
{
	::init();
	add_action("do_join", "join");
}

#include "/kungfu/class/yunlong/tiandihui.h"
