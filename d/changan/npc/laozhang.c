//laozhang.c

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("老张", ({"lao zhang", "zhang", "boss"}));
	set("title", "面馆老板");
	set("gender", "男性");
	set("age", 35);
	set("qi", 350); 
	set("max_qi", 350);
	set("jing", 200);
	set("max_jing", 200);	
	set("combat_exp", 10000);
	set("attitude", "friendly");
	set("env/wimpy", 50);
	set("chat_chance", 10);
	set_skill("unarmed", 40);
	set_skill("dodge", 40);
        set("vendor_goods", ({
        	__DIR__"obj/miantang",
        	__DIR__"obj/miantiao1",
        	__DIR__"obj/miantiao2",
        	__DIR__"obj/miantiao3",
        }));

	setup();
        carry_object(__DIR__"obj/choupao")->wear();
	add_money("silver", 1);
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
        add_action("do_buy", "buy");
	add_action("do_list", "list"); 	
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment()) return;
        say("老张热情地说道：这位" + RANK_D->query_respect(ob) +
            "，进来吃碗热乎的面条吧!。\n");
}
