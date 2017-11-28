// chang2.c 常伯志

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("常伯志", ({ "chang bozhi", "chang","bozhi" }));
	set("title", HIR "红花会"HIG"六当家" NOR);
	set("nickname", HIB "白无常" NOR);
	set("long", 
"他身材又高又瘦，脸色蜡黄，眼睛凹进，眉毛斜斜的倒垂下来，形
相甚是可怖。他是青城派慧侣道人的徒弟。黑沙掌的功夫，江湖上无
人能敌。黑白无常两兄弟是川江上著名的侠盗，一向劫富济贫，不过
心狠手辣，因此得了这难听的外号。\n");
	set("gender", "男性");
	set("class", "fighter");
	set("age", 42);
	set("attitude", "aggressive");
	set("shen_type", 1);
	set("per", 14);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 2500);
	set("max_jing", 1000);
	set("neili", 2000);
	set("max_neili", 2000);
	set("jiali", 100);
	set("combat_exp", 500000);

	set_skill("force", 120);
	set_skill("dodge", 120);
	set_skill("parry", 120);
	set_skill("hand", 120);
	set_skill("claw", 120);
	set_skill("yunlong-shengong", 120);
	set_skill("yunlong-shenfa", 120);
	set_skill("yunlong-shou", 120);
	set_skill("yunlong-zhua", 120);

	map_skill("dodge", "yunlong-shenfa");
	map_skill("force", "yunlong-shengong");
	map_skill("hand", "yunlong-shou");
	map_skill("parry", "yunlong-shou");
	map_skill("claw", "yunlong-zhua");

	prepare_skill("hand","yunlong-shou");
	prepare_skill("claw","yunlong-zhua");
	set("env/wimpy", 20);
	create_family("青城派",21, "弟子");

 	setup();
	carry_object("/clone/misc/cloth")->wear();
}

