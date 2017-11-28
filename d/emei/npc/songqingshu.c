inherit NPC;

mixed ask_for_zhou();

void create()
{
        set_name("宋青书", ({ "song qingshu", "song" }));
        set("long",
                "他就是宋远桥的儿子宋青书。\n"
                "他今年二十岁，乃是武当第三代中出类拔萃的人物。\n");
        set("gender", "男性");
        set("age", 20);
        set("attitude", "aggressive");
        set("shen_type", -1);
        set("score", 100000);

        set("str", 25);
        set("int", 28);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 4000);
        set("max_jing", 2000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jingli", 2000);
        set("max_jingli", 2000);
        set("jiali", 150);
        set("combat_exp", 1800000);

        set("inquiry",([
                "周芷若"  : (: ask_for_zhou :),
        ]));

        set_skill("force", 200);
        set_skill("wudang-xinfa", 180);
        set_skill("taiji-shengong", 180);
        set_skill("yijin-duangu", 200);
        set_skill("dodge", 200);
        set_skill("shexing-lifan", 200);
        set_skill("tiyunzong", 180);
        set_skill("unarmed", 180);
        set_skill("taiji-quan", 180);
        set_skill("strike", 200);
        set_skill("zhenshan-zhang", 180);
        set_skill("cuixin-zhang", 200);
        set_skill("wudang-zhang", 180);
        set_skill("claw", 200);
        set_skill("jiuyin-baiguzhao", 200);
        set_skill("hand", 180);
        set_skill("paiyun-shou", 180);
        set_skill("parry", 180);
        set_skill("sword", 180);
        set_skill("wudang-jian", 180);
        set_skill("taiji-jian", 180);
        set_skill("taoism", 180);
        set_skill("literate", 180);

        map_skill("force", "yijin-duangu");
        map_skill("dodge", "shexing-lifan");
        map_skill("unarmed", "taiji-quan");
        map_skill("hand", "paiyun-shou");
        map_skill("parry", "taiji-quan");
        map_skill("sword", "taiji-jian");
        map_skill("strike", "cuixin-zhang");
        map_skill("claw", "jiuyin-baiguzhao");

        prepare_skill("strike", "cuixin-zhang");
        prepare_skill("claw", "jiuyin-baiguzhao");

        create_family("武当派", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "claw.duo" :),
                (: perform_action, "claw.jie" :),
                (: perform_action, "strike.cuixin" :),
                (: perform_action, "dodge.guiyuan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }));

        setup();
        carry_object("/d/city/obj/cloth")->wear();
}

mixed ask_for_zhou()
{
        object ob;
        ob = this_player();
        command("heng");
        command("say " + ob->query("name") + "你是什么东西？敢直呼芷若的名字？\n");
        kill_ob(this_player());
        return -1;
}