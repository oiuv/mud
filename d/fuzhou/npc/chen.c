#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
	set_name("陈阿婆", ({ "chen apo", "chen", "apo" }));
	set("title", "杂货铺老板");
	set("nickname", HIC "消息灵通" NOR);
	set("shen_type", 1);
	set("str", 20);
	set("gender", "女性");
	set("age", 55);
	set("long", "陈阿婆久居佛州城，据说她年轻时很有几分风韵。\n");
	set("combat_exp", 800);
	set("attitude", "friendly");
	set("inquiry", ([
                "林震南" : "阿南生着那俊，那会琢一个河南七子婆，唉。\n",
	]));

	set("vendor_goods", ({
		"/d/fuzhou/obj/xiuhua",
		"/d/fuzhou/obj/flower_shoe",
                "/d/fuzhou/obj/pink_cloth",
                "/d/city/obj/goldring",
                "/d/city/obj/necklace",
	}));

	setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
	object ob;
	::init();

	if (interactive(ob = this_player()) && ! is_fighting())
        {
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

void greeting(object ob)
{
	if (! ob || environment(ob) != environment())
		return;
	switch(random(2))
        {
	case 0 :
		say(CYN "陈阿婆笑眯眯地招呼道：人客来坐。\n" NOR);
		break;
	case 1 :
		say(CYN "陈阿婆笑眯眯地说道：可嘴的，你要买什？\n" NOR);
		break;
	}
}
