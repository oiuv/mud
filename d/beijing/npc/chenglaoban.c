inherit NPC;
inherit F_DEALER;

string ask_me1();
string ask_me2();

void create()
{
	set_name("程老板", ({ "cheng laoban", "cheng" }));
	set("title", "全聚德老板");
	set("shen_type", 1);

	set("str", 20);
	set("gender", "男性");
	set("age", 65);
	set("long", "程老板经营祖传下来的全聚德酒楼已有多年。\n");

	set("combat_exp", 50000);

	set("qi", 300);
	set("max_qi", 300);
	set("attitude", "friendly");

	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/defense", 30);

	set("vendor_goods", ({
		"/d/city/obj/hdjiudai",
		"/d/beijing/obj/kaoya",
	}));

	setup();
	add_money("gold", 1);
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
	add_action("do_list", "list");
	add_action("do_buy", "buy");
}