#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
	set_name("茶博士", ({ "cha boshi", "boshi" }));
	set("title", "茶馆老板");
	set("nickname", HIC "消息灵通" NOR);
	set("shen_type", 1);

	set("str", 30);
	set("gender", "男性");
	set("age", 35);
	set("long",
		"这个茶博士可是衡阳城里消息灵通人士，每日迎来送往，\n"
		"所以对城里的一举一动都了如指掌。\n");
	set("combat_exp", 500);
	set("attitude", "friendly");

	set("vendor_goods", ({
        	"/d/city/npc/obj/peanut",
        	"/d/city/npc/obj/tofu",
	}));

	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");

        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
	if (! ob || environment(ob) != environment())
		return;
	switch(random(2))
	{
	case 0 :
		say(CYN "茶博士揩了揩桌子说道：这位" + RANK_D->query_respect(ob) +
			"，哈你家快请进来喝杯热茶。\n" NOR);
		break;
	case 1 :
		say(CYN "茶博士说道：哈你家！这位" + RANK_D->query_respect(ob) +
			"哈你家小店卖茶不卖酒，哈你家！\n" NOR);
		break;
	}
}
