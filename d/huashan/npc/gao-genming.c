// gao-genming.c

inherit NPC;
inherit F_GUARDER;

int permit_pass(object me, string dir);

void create()
{
        set_name("高根明", ({ "gao genming","gao","genming" }) );
        set("nickname", "市井豪杰");
        set("gender", "男性");
        set("age", 24);
        set("long",
                "高根明是岳不群的第五位弟子。\n");
        set("attitude", "peaceful");

        set("str", 26);
        set("con", 30);
        set("int", 24);
        set("dex", 30);

        set("neili", 900);
        set("max_neili", 900);

        set("combat_exp", 30000);
        set("score", 20000);
        set("shen_type", 1);

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :)
        }) );

        set_skill("unarmed", 50);
        set_skill("sword", 50);
        set_skill("force", 50);
        set_skill("parry", 50);
        set_skill("dodge", 50);
        set_skill("literate", 30);

        set_skill("huashan-jian", 50);
        set_skill("huashan-xinfa", 50);
        set_skill("huashan-quanfa", 50);
        set_skill("feiyan-huixiang", 50);

        map_skill("sword", "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("force", "huashan-xinfa");
        map_skill("unarmed", "huashan-quanfa");
        map_skill("dodge", "feiyan-huixiang");

        set("coagents", ({
                ([ "startroom" : "/d/huashan/qunxianguan",
                   "id"        : "yue buqun" ]),
        }));

        create_family("华山派", 14, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

int permit_pass(object me, string dir)
{
        object *inv;
        int i;

        if (! living(this_object()))
                return 1;

        if (me->query_temp("beg_huashan"))
        {
                message_vision("$N眼睛一弹，对$n喝道：“你乱"
                               "跑个啥？是奸细么？”\n", this_object(), me);
                return -1;
        }

        notify_fail("看来" + name() + "不打算让你过去。\n");

        inv = all_inventory(me);
        for (i = 0; i < sizeof(inv); i++)
        {
                if (! playerp(inv[i])) continue;
                if ((string) inv[i]->query("family/family_name") != "华山派")
                {
                        message_vision("$N对$n喝道：你背的是谁？还不快快放下！\n",
                                       this_object(), me);
                        return 0;
                }
        }

        if (me->query("family/family_name") &&
            me->query("family/family_name") != "华山派" ||
            ! me->query("family/family_name") &&
            me->query("combat_exp") > 20000)
        {
                message_vision("$N对$n道：对不起，不是我们华山派的人"
                               "请勿入本派重地。\n", this_object(), me);
                return 0;
        }

        return 1;
}
