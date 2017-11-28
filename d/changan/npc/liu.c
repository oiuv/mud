//liu.c

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("刘老实", ({ "liu laoshi", "liu" }));
	set("title", "杂货铺老板");
	set("shen_type", 1);
	set("gender", "男性");
	set("age", 55);
	set_skill("unarmed", 40);
	set_skill("dodge", 40);
	set_temp("apply/damage", 15);
	set("combat_exp", 50000);
	set("attitude", "friendly");
	set("vendor_goods", ({
		__DIR__"obj/beixin",
		__DIR__"obj/shield",
		__DIR__"obj/muqin",
		"/d/xingxiu/obj/fire",
		"/d/item/obj/chanhs",
		"/clone/misc/wood",
		//"/clone/misc/shoeshine",
		//"/clone/misc/brush",
		"/clone/misc/diaogan",
		"/clone/misc/yuer",
		"/clone/misc/yanwu",
		"/clone/misc/shexiang",
        }));

	setup();
	carry_object(__DIR__"obj/changpao")->wear();
}
void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
