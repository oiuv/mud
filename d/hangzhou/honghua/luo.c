// luo.c 骆冰

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("骆冰", ({ "luo bing", "luo","bing" }));
	set("title", HIR "红花会"HIG"十一当家" NOR);
	set("nickname", HIG "鸳鸯刀" NOR);
	set("long", 
"她是一个秀美的少妇。一手短刀，一手握着一柄长刀。\n");
	set("gender", "女性");
	set("class", "fighter");
	set("age", 24);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 28);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 1400);
	set("max_jing", 700);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 150000);

	set_skill("literate", 100);
	set_skill("force", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);
	set_skill("blade", 100);
	set_skill("hand", 100);
	set_skill("claw", 100);
	set_skill("yunlong-shengong", 100);
	set_skill("wuhu-duanmendao", 100);
	set_skill("yunlong-shenfa", 100);
	set_skill("yunlong-shou", 100);
	set_skill("yunlong-zhua", 100);

	map_skill("dodge", "yunlong-shenfa");
	map_skill("force", "yunlong-shengong");
	map_skill("blade", "wuhu-duanmendao");
	map_skill("hand", "yunlong-shou");
	map_skill("parry", "yunlong-shou");
	map_skill("claw", "yunlong-zhua");

	prepare_skill("hand","yunlong-shou");
	prepare_skill("claw","yunlong-zhua");
	set("env/wimpy", 20);

 	setup();
	carry_object("/clone/cloth/jinduan")->wear();
	carry_object("/clone/weapon/gangdao")->wield();
}


