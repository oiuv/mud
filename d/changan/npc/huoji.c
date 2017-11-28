//huoji.c

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("小伙计", ({"huo ji"}));
        set("age", 18);
        set("gender", "男性");
        set("long","包子铺的伙计，懒洋洋的看着你。\n");
	set("shop_title", "包子铺伙计");
        set("attitude", "friendly");
        set("combat_exp", 10000);
        set("shen_type", 1);
	set("neili", 200);
	set("jiali", 5);
        set_skill("unarmed", 20);
        set_skill("dodge", 60);
        set_skill("parry", 20);
        set("vendor_goods", ({
        	__DIR__"obj/bao1",
        	__DIR__"obj/bao2",                
        	__DIR__"obj/bao3",                
        }));

	setup();
        add_money("silver", 3);
        carry_object(__DIR__"obj/linen")->wear();
}

int accept_fight(object me)
{
        command("say 这位大侠，小人那敢跟您动手啊！\n");
        return 0;
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && !is_fighting() ) 
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
	}
        add_action("do_buy", "buy");
	add_action("do_list", "list"); 	
}

void greeting(object ob)
{
        if (! ob || ! visible(ob) || environment(ob) != environment())
                return;

        say(name()+"带理不理地说道：这位" +RANK_D->query_respect(ob) +
            "，进来吃几个包子吧。\n");
}
