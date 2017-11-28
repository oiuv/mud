// xiejian.c 邪剑李四

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("李四", ({ "li si", "li" }) );
	set("title", "小店老板");
	set("gender", "男性" );
	set("shen_type", -1);
	set("age", 40);

	set("str", 30);
	set("con", 30);
	set("int", 30);
	set("dex", 30);

	set("long",
		"这是整天笑咪咪的小店老板，虽然不卖什麽东西，却也过得自在。\n" );

	set("combat_exp", 100000);
	set("attitude", "peaceful");
	set("chat_chance", 1);
	set("chat_msg", ({
		"李四说道: 这位客官，您想买些什麽东西吗 ?\n",
	}) );

	set("inquiry", ([
	        "邪剑"   : "我已经归隐了，不干这行了。",
	        "杀人"   : "我已经归隐了，不干这行了。",
	]) );

	set("max_qi", 700);
	set("max_jing", 400);
	set("neili", 700);
	set("max_neili", 700);
	set("jiali", 50);
	set("shen_type", -1);
	set("env/wimpy", 60);

	set_skill("force", 60); 
	set_skill("unarmed", 80);
	set_skill("sword", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);
	
	setup();
	
	carry_object("d/city/obj/gangjian")->wield();
	carry_object("d/city/obj/cloth")->wear();
}

