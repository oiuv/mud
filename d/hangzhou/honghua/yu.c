// yu.c 余鱼同

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("余鱼同", ({ "yu yutong", "yu","yutong" }));
	set("title", HIR "红花会"HIG"十四当家" NOR);
	set("nickname", YEL "金笛秀才" NOR);
	set("long", 
"一个长身玉立，眉清目秀，风流英俊的书生。余鱼同乃江南望族
子弟，中过秀才。他父亲因和一家豪门争一块坟地，官司打得倾家
荡产，又被豪门借故陷害，瘐死狱中。余鱼同一气出走，得遇机缘，
拜马真为师，弃文习武，回来把士豪刺死，从此亡命江湖，后来入
了红花会。他为人机警灵巧，多识各地乡谈，在会中任联络四方、
刺探讯息之职。\n");
	set("gender", "男性");
	set("class", "scholar");
	set("age", 20);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 27);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 3000);
	set("max_jing", 1000);
	set("neili", 2000);
	set("max_neili", 2000);
	set("jiali", 100);
	set("combat_exp", 1000000);
	set("score", 500000);

	set_skill("literate", 100);
	set_skill("force", 200);
	set_skill("dodge", 200);
	set_skill("unarmed", 200);
	set_skill("parry", 200);
	set_skill("whip", 200);
	set_skill("blade", 200);
	set_skill("sword", 200);
	set_skill("hand", 200);
	set_skill("claw", 200);
	set_skill("houquan", 150);
	set_skill("yunlong-xinfa", 200);
	set_skill("yunlong-shengong", 200);
	set_skill("wuhu-duanmendao", 150);
	set_skill("yunlong-jian", 200);

	set_skill("yunlong-shenfa", 150);
	set_skill("yunlong-bian", 150);
	set_skill("yunlong-shou", 150);
	set_skill("yunlong-zhua", 150);

	map_skill("dodge", "yunlong-shenfa");
	map_skill("force", "yunlong-shengong");
	map_skill("unarmed", "houquan");
	map_skill("blade", "wuhu-duanmendao");
	map_skill("hand", "yunlong-shou");
	map_skill("parry", "yunlong-shou");
	map_skill("claw", "yunlong-zhua");
	map_skill("sword", "yunlong-jian");
	map_skill("whip", "yunlong-bian");

	prepare_skill("hand","yunlong-shou");
	prepare_skill("claw","yunlong-zhua");
	set("env/wimpy", 20);
	create_family("武当派", 18, "弟子");

 	setup();
	carry_object("/clone/cloth/jinduan")->wear();
	carry_object("/clone/cloth/yaodai")->wear();
	carry_object("/clone/weapon/changjian")->wield();
}

