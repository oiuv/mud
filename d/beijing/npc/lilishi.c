#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("李力世", ({ "li lishi", "li" }));
	set("title", HIG "天地会青木堂"NOR"会众");
	set("gender", "男性");
	set("age", 45);
	set("str", 25);
	set("dex", 20);
	set("long", "这是一个身材矮小，满连胡须的中年人，身上的\n"+
"衣服又脏又破，脸上满是皱纹，看上去饱经风霜。\n");
	set("combat_exp", 35000);
	set("score", 5000);
	set("shen_type", 1);
	set("attitude", "peaceful");
	set_skill("unarmed", 50);
	set_skill("force", 60);
	set_skill("blade", 90);
	set_skill("dodge", 70);
	set_skill("parry", 50);
	set_skill("wuhu-duanmendao", 90);
	set_skill("yunlong-shenfa", 60);
	map_skill("blade", "wuhu-duanmendao");
	map_skill("dodge", "yunlong-shenfa");

	set("neili", 150); 
	set("max_neili", 150);
	set("jiali", 10);
	setup();
	carry_object("/d/beijing/npc/obj/blade2")->wield();
	carry_object("/d/beijing/npc/obj/cloth")->wear();
	add_money("silver", 20);
}
