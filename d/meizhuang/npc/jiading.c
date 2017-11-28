// jiading.c

inherit NPC;

void create()
{
        set_name("家丁", ({ "jia ding", "ding", }));
        set("long",
                "他是一位身着青衣的梅庄家丁，衣服的袖口上绣着一朵梅花。\n"
                "手中拿着一对判官笔，似乎有一身武艺。\n"
        );

        set("gender", "男性");
        set("attitude", "aggressive");
        set("class", "fighter");

        set("age", 20);
        set("shen_type", -1);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("combat_exp", 3000);

        set_skill("force", 30);
        set_skill("dodge", 30);
        set_skill("unarmed", 30);
        set_skill("parry", 30);
        set_skill("blade", 30);

        setup();

        carry_object(__DIR__"obj/panguan-bi")->wield();
        carry_object(__DIR__"obj/qingyi")->wield();
}
