inherit NPC;

void create()
{
        set_name("纪晓芙", ({ "ji xiaofu","ji","xiaofu"}));
        set("long", "她是峨嵋派的第四代俗家弟子。灭绝抛弃她，\n"
                    "她独自在这里苦度光阴。\n");
        set("gender", "女性");
        set("age", 22);
        set("attitude", "peaceful");
        set("class", "fighter");
        set("shen_type", 1);

        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("per", 30);
        set("inquiry",([
                "倚天剑"  : "这是我们郭师祖传下来的镇派之宝，可听说被夺走了。",
                "屠龙刀"  : "武林至尊，宝刀屠龙。",
                "杨不悔"  : "我的女儿啊。她在哪里？你知道么？",
                "杨逍"    : "我这辈子是不指望见到他了。",
                "灭绝"    : "师父就是太偏心。",
        ]));

        set("max_qi", 2500);
        set("max_jing", 1200);
        set("neili", 2700);
        set("max_neili", 2700);
        set("combat_exp", 320000);

        set_skill("force", 120);
        set_skill("emei-xinfa", 120);
        set_skill("dodge", 100);
        set_skill("zhutian-bu", 100);
        set_skill("strike", 80);
        set_skill("sixiang-zhang", 80);
        set_skill("hand", 60);
        set_skill("jieshou-jiushi", 60);
        set_skill("parry", 100);
        set_skill("sword", 120);
        set_skill("emei-jian", 120);
        set_skill("literate", 100);
        set_skill("mahayana", 100);
        set_skill("buddhism", 100);
        set_skill("martial-cognize", 20);

        map_skill("force","emei-xinfa");
        map_skill("hand", "jieshou-jiushi");
        map_skill("dodge","zhutian-bu");
        map_skill("strike","sixiang-zhang");
        map_skill("sword","emei-jian");
        map_skill("parry","emei-jian");

        prepare_skill("strike", "sixiang-zhang");

        create_family("峨嵋派", 4, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.xian" :),
                (: perform_action, "strike.xing" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/city/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("sigh");
        command("say 你找我其它师姐吧。");
}
