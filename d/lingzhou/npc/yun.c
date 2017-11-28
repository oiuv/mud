// yun.c

inherit NPC;

#include <ansi.h>;
void create()
{

	set_name("云中鹤", ({ "yun zhonghe", "yun" }));
	set("gender", "男性");
	set("nickname", HIY"穷凶极恶"NOR);
	set("age", 34);
	set("str", 25);
	set("dex", 16);
	set("per", 21);
	set("long", "此人长得又高又瘦象一杆大竹竿，说话声音忽尖忽粗，十分难
听，穿着一身青衫，一副色迷迷模样。\n");
	set("combat_exp", 150000);
	set("shen_type", -1);
	set("attitude", "peaceful");
	set("neili", 1000); 
	set("max_neili", 1000);
	set("jiali", 50);

	set_skill("strike", 80);
	set_skill("claw", 80);
	set_skill("force", 80);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	set_skill("sanyin-wugongzhao", 80);
	set_skill("chousui-zhang", 80);
	set_skill("huagong-dafa", 80);
	set_skill("shaolin-shenfa", 80);
	map_skill("dodge", "shaolin-shenfa");
	map_skill("force", "huagong-dafa");
	map_skill("parry", "chousui-zhang");
	map_skill("claw", "sanyin-wugongzhao");
	map_skill("strike", "chousui-zhang");
	prepare_skill("claw", "sanyin-wugongzhao");
	prepare_skill("strike", "chousui-zhang");

	setup();
	carry_object("/clone/cloth/bupao")->wear();
}

