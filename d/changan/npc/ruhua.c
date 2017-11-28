//ruhua.c

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("如花", ({"ru hua"}));
        set("shop_title", "老板娘");
        set("gender", "女性");
        set("combat_exp", 4000);
        set("age", 34);
        set("per", 40);
        set("attitude", "friendly");
        set("shen_type", 1);
        set_skill("unarmed", 30);
        set_skill("dodge", 30);
        set_skill("parry", 30);
        set("vendor_goods", ({
                __DIR__"obj/baijiu",
        }));

        setup();
        carry_object(__DIR__"obj/skirt")->wear();
        add_money("coin", 10);
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
        say("如花笑咪咪地说道：这位" + RANK_D->query_respect(ob) +
            "，奴家给你倒杯酒尝尝吧!\n");
}

