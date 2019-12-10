#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
	set_name("茶小二", ({ "xiao er", "xiao" }));
	set("nickname", HIC "消息灵通" NOR);
	set("shen_type", 1);

	set("str", 30);
	set("gender", "男性");
	set("age", 25);
	set("long",
		"这个茶小二正忙着给客人送茶，递烟。");
	set("combat_exp", 500);
	set("attitude", "friendly");

	set("vendor_goods", ({
		__DIR__"obj/yan",
		__DIR__"obj/wan",
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

        if ( interactive(ob = this_player()) && !is_fighting() )
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
		say (CYN "茶小二热情的说到：这位" + RANK_D->query_respect(ob) +
		     CYN "，马上给你上茶。\n" NOR);
		break;
	case 1 :
		say (CYN "茶小二说道：这位" + RANK_D->query_respect(ob) +
		     CYN "要不要来两口水烟提提神。\n" NOR);
		break;
	}
}
