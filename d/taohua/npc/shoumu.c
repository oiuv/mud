// shoumu.c 守墓家奴

inherit NPC;

void create()
{
        set_name("守墓家奴", ({ "shou mu" }));
        set("age", 28);
        set("gender", "男性");
        set("long",
"他是桃花岛岛主夫人的守墓家奴。\n");
        set("attitude", "peaceful");
        set("str", 24);
        set("dex", 16);
        set("shen_type", 1);
        set("combat_exp", 100000);

        set_skill("unarmed", 80);
        set_skill("force", 80);
        set_skill("parry", 80);
        set_skill("dodge", 40);
        set_skill("sword", 80);
        set_skill("literate", 20);
        set_skill("jiuyin-baiguzhao", 90);
        set_skill("luoying-shenjian",90);
        set_skill("bibo-shengong", 90);
        set_skill("anying-fuxiang", 90);

        map_skill("force", "bibo-shengong");
        map_skill("parry", "luoying-shenjian");
        map_skill("sword", "luoying-shenjian");
        map_skill("dodge", "anying-fuxiang");
        map_skill("unarmed", "jiuyin-baiguzhao");

        create_family("桃花岛", 3, "守墓弟子");
        setup();
        carry_object("/clone/cloth/cloth")->wear();
}
