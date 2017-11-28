//keeper.c

inherit NPC;

void create()
{
        set_name("庙祝", ({ "miao zhu", "miao", "zhu" }) );
        set("gender", "男性" );
        set("age", 60);
        set("long", "这个老人看起来六十多岁了，精神却很好。\n");
        set("combat_exp", 100);
        set("attitude", "friendly");

        setup();
}

void init()
{
        object ob;
        ::init();
        if (interactive(ob = this_player()) && !is_fighting()) 
        {
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || ! present(ob, environment(this_object()))) 
                return;

        say("庙祝说道：这位" + RANK_D->query_respect(ob) +
            "，捐点香火钱吧。\n");
}

