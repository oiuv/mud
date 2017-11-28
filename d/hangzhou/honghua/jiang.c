// jiang.c 蒋四根

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("蒋四根", ({ "jiang sigen", "jiang","sigen" }));
	set("title", HIR "红花会"HIG"十三当家" NOR);
	set("nickname", HIY "铜头鳄鱼" NOR);
	set("long", 
"铜头鳄鱼蒋四根在会中坐第十三把交椅，兵器是铁桨。\n");
	set("gender", "男性");
	set("class", "fighter");
	set("age", 21);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 20);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 1100);
	set("max_jing", 800);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 150000);

	set_skill("force", 80);
	set_skill("dodge", 80);
	set_skill("unarmed", 80);
	set_skill("parry", 80);
	set_skill("club", 80);
	set_skill("houquan", 80);
	set_skill("yunlong-shengong", 80);
	set_skill("zui-gun", 100);
	set_skill("yunlong-shenfa", 80);

	map_skill("dodge", "yunlong-shenfa");
	map_skill("force", "yunlong-shengong");
	map_skill("unarmed", "houquan");
	map_skill("club", "zui-gun");
	map_skill("parry", "zui-gun");
	set("env/wimpy", 20);

 	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object(__DIR__"obj/tiejiang")->wield();
}

