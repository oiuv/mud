// japanese.c 日本鬼子入侵者

inherit __DIR__"invader";


void create()
{
//      object ob;
        set_name("日本鬼子", ({ "japanese" }));
        set("long", "日本鬼子。\n");
        set("gender", "男性");
        set("age", 20);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);

        // the follow 5 setting has no use
        set("max_qi", 100);
        set("max_jing", 100);
        set("neili", 100);
        set("max_neili", 100);
        set("jiali", 100);
        set("shen", -1000);

        set("combat_exp", 3000000);
        set("scale", 100);

        set_skill("force", 1);
        set_skill("fushang-neigong", 1);
        set_skill("dodge", 1);
        set_skill("renshu", 1);
        set_skill("parry", 1);
        set_skill("dongyang-dao", 1);
        set_skill("blade", 1);

        map_skill("blade", "dongyang-dao");
        map_skill("force", "fushang-neigong");
        map_skill("dodge", "renshu");
        map_skill("parry", "dongyang-dao");

        set("rank_info/rude", "鬼子");

        set("chat_chance", 10);
        set("chat_msg", ({ (: do_leave :) }));

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "blade.luan" :),
                (: perform_action, "blade.zhan" :),
        }));      

        setup();
        if (clonep()) keep_heart_beat();
        set("born_time", time());

        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/jpn-dao")->wield();

}



