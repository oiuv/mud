inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("姬清虚", ({ "ji qingxu", "ji", "qingxu" }));
        set("gender", "男性");
        set("age", 24);
        set("class", "taoist");
        set("long", "他是一位体格强健的青年道士，似乎身怀武艺。\n");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 26);
        set("int", 25);
        set("con", 25);
        set("dex", 26);

        set("max_qi", 800);
        set("max_jing", 500);
        set("neili", 800);
        set("max_neili", 800);
        set("jiali", 30);

        set("combat_exp", 50000);

        set_skill("force", 60);
        set_skill("quanzhen-xinfa", 60);
        set_skill("dodge", 50);
        set_skill("tianshan-feidu", 50);
        set_skill("parry", 50);
        set_skill("sword", 50);
        set_skill("qixing-jian", 50);
        set_skill("finger", 40);
        set_skill("zhongnan-zhi", 40);
        set_skill("literate", 50);
        set_skill("taoism", 50);
        set_skill("martial-cognize", 20);

        map_skill("force", "quanzhen-xinfa");
        map_skill("parry", "qixing-jian");
        map_skill("sword", "qixing-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("finger", "zhongnan-zhi");

        prepare_skill("finger", "zhongnan-zhi");

        create_family("全真教", 4, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: perform_action, "sword.xing" :),
                (: perform_action, "finger.zhi" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();

}

void attempt_apprentice(object ob)
{
        command("shy");
        command("say 对…对不起。我也是刚入门不久。");
        return;
}
