#include <ansi.h>
inherit NPC;

void create()
{
	set_name("小混混", ({ "xiao hunhun", "xiao", "hunhun" }));
	set("long", "他是扬州里的小混混，整天闲着没事干。\n");
	set("gender", "男性");
	set("age", 15);
	set("attitude", "friendly");
	set("shen_type", -1);

	set("per", 15);
	set("str", 15);
	set("int", 14);
	set("con", 15);
	set("dex", 16);
	set("qi", 100);
	set("max_qi", 100);
	set("jing", 100);
	set("max_jing", 100);
	set("neili", 10);
	set("max_neili", 10);
	set("combat_exp", 200);
	set_skill("unarmed", 10);
	set_skill("dodge", 10);
	set_skill("parry", 10);

	set("chat_chance", 2);
	set("chat_msg", ({
		CYN "小混混唱道: 一二三四五，上山打老虎，老虎没吃饭，专吃大坏蛋！\n" NOR,
		CYN "小混混哼道：大事不好，房子要倒，母猪母猪，我看你往哪跑！\n" NOR,
		(: random_move :)
	}) );

	setup();
	carry_object("/clone/misc/cloth")->wear();
}
