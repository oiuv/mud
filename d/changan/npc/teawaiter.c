//teawaiter.c

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("茶馆小二",({"waiter","xiaoer","xiao","xiaoer","er"}));
        set("shop_id",({"waiter","xiaoer","xiao","er"}));
        set("shop_title","茶馆小二");
        set("gender", "男性");
        set("combat_exp", 1000);
        set("age", 26);
        set("per", 24);
        set("attitude", "friendly");
        set("shen_type", 1);
        set_skill("unarmed", 34);
        set("vendor_goods", ({
        	__DIR__"obj/teapot",
        }));

        setup();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && !is_fighting()) 
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
	}
        add_action("do_buy", "buy");
	add_action("do_list", "list"); 	
}


void greeting(object ob)
{
        if (! ob || environment(ob) != environment())
                return;
        switch(random(3))
        {
        case 0:
                say("小二儿笑咪咪地说道：这位" +
                    RANK_D->query_respect(ob) +
                    "，进来喝杯茶，歇歇腿吧。\n");
                break;
        case 1:
                say("小二儿用毛巾抹了抹身边的一张桌子，说"
                    "道：这位" + RANK_D->query_respect(ob) +
                    "，快请进。\n");
                break;
        case 2:
                say("小二儿说道：这位" + RANK_D->query_respect(ob) +
                    "，进来尝尝我们新采的茶叶吧。准保您满意。\n");
                break;
        }
}
