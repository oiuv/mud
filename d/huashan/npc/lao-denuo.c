// lao-denuo.c

inherit NPC;
inherit F_GUARDER;

int permit_pass(object me, string dir);

void create()
{
        set_name("劳德诺", ({ "lao denuo","lao","denuo" }) );
        set("nickname", "老好人");
        set("gender", "男性");
        set("age", 61);
        set("long", "劳德诺是岳不群的二弟子。\n");
        set("attitude", "peaceful");

        set("str", 26);
        set("con", 30);
        set("int", 24);
        set("dex", 30);

        set("max_qi", 3400);
        set("max_jing", 1700);
        set("neili", 2800);
        set("max_neili", 2800);

        set("combat_exp", 150000);
        set("shen_type", -1);
        set("score", 5000);

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :)
        }) );

        set_skill("unarmed", 95);
        set_skill("sword", 95);
        set_skill("force", 95);
        set_skill("parry", 95);
        set_skill("dodge", 95);
        set_skill("literate", 40);

        set_skill("huashan-jian", 95);
        set_skill("huashan-xinfa", 95);
        set_skill("huashan-quanfa", 95);
        set_skill("feiyan-huixiang", 95);

        map_skill("sword", "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("force", "huashan-xinfa");
        map_skill("unarmed", "huashan-quanfa");
        map_skill("dodge", "feiyan-huixiang");

        set_temp("apply/damage", 100);
        set_temp("apply/armor", 100);

        set("apply/dodge", 100);

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

        if (me->query("family/family_name") == "华山剑宗" &&
            dir == "southup")
        {
                if (me->query_temp("beg_huashan"))
                {
                        command("say 回头是岸，回头是岸啊！");
                        return 1;
                }

                message_vision("$N劝道：家师有交代，剑宗廿五年"
                               "前就离开华山了，自认不是华山弟子了。\n"
                               "我虽是老好人，这位" + RANK_D->query_respect(me) +
                               "还是请回吧。\n", this_object());
                return -1;
        }


        notify_fail("看来" + name() + "不打算让你过去。\n");

        inv = deep_inventory(me);
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

void relay_emote(object me, string verb)
{
        if (verb != "beg")
        {
                switch (random(5))
                {
                case 0:
                        command("bored");
                        break;

                case 1:
                        command("shzi");
                        break;

                case 2:
                        command("@@");
                        break;

                case 3:
                        command("cold");
                        break;

                default:
                        command("heihei");
                        break;
                }
                return;
        }

        if (me->query("family/family_name") != "华山剑宗")
        {
                command("poor " + me->query("id"));
                return;
        }

        command("sigh");
        command("say 这位" + RANK_D->query_respect(me) +
                "！入了剑宗，后悔了吧？不要紧，回头是岸嘛！");
        me->set_temp("beg_huashan", 1);
}
