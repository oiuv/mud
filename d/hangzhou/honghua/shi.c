// shi.c 石双英

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("石双英", ({ "shi shuangying", "shi","shuangying" }));
	set("title", HIR "红花会"HIG"十二当家" NOR);
	set("nickname", HIG "鬼见愁" NOR);
	set("long", 
"鬼见愁石双英在会中坐第十二把交椅，执掌刑堂，铁面无私，心狠手
辣，犯了规条的就是逃到天涯海角，他也必派人抓来处刑，原来依据红
花会规条，会中兄弟犯了大罪，若是一时胡涂，此后诚心悔悟，可在开
香堂执法之前，自行用尖刀在大腿上连戳三刀，这三刀须对穿而过，即
所谓“三刀六洞”，然后向该管舵主和执法香主求恕，有望从轻发落，
但若真正罪重出自不能饶恕。是以红花会数万兄弟，提到鬼见愁时无不
悚然。\n");
	set("gender", "男性");
	set("class", "scholar");
	set("age", 24);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 26);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 1500);
	set("max_jing", 700);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 200000);

	set_skill("force", 90);
	set_skill("dodge", 90);
	set_skill("unarmed", 90);
	set_skill("parry", 90);
	set_skill("sword", 90);
	set_skill("taiji-quan", 95);
	set_skill("taiji-shengong", 90);
	set_skill("taiji-jian", 90);
	set_skill("tiyunzong", 90);

	map_skill("dodge", "tiyunzong");
	map_skill("force", "taiji-shengong");
	map_skill("unarmed", "tianji-quan");
	map_skill("parry", "taiji-jian");
	map_skill("sword", "taiji-jian");

	set("env/wimpy", 20);
	create_family("太极门",8, "弟子");

 	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object("/clone/weapon/changjian")->wield();
}


