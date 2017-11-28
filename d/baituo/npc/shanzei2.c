inherit NPC;

void create()
{
        set_name("山贼", ({ "shan zei", "shan", "zei" }));
        set("gender", "男性" );
        set("age", 20);
        set("long", "这是个面目可憎的山贼。\n");
        set("attitude", "friendly");
        set("shen_type", -1);

        set("str", 21);
        set("int", 21);
        set("con", 22);
        set("dex", 21);

        set("max_qi", 200);
        set("max_jing", 200);
        set("neili", 80);
        set("max_neili", 80);
        set("combat_exp", 30000);
        set("score", 2000);

        setup();
        add_money("silver", 2);
        carry_object("/clone/misc/cloth")->wear();
        carry_object("/d/baituo/obj/dadao")->wield();
}

void init()
{
        object ob;

        ::init();

        if (interactive(ob = this_player()))
        {
                        remove_call_out("kill_ob");
                        call_out("kill_ob", 1, ob);
        }
}
