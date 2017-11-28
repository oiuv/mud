inherit NPC;

void create()
{
        set_name("程英", ({ "cheng ying", "cheng", "ying" }));
        set("gender", "女性" );
        set("age",18);
        set("long", "程英是黄药师从小收养的孤女。由黄药师亲手\n"
                    "教得了一手人人称绝的烹调手法，因此桃花岛\n"
                    "的膳食就由她负责。\n");
        set("per", 30);
        set("class", "scholar");
        set("combat_exp", 10000);

        set_skill("unarmed", 50);
        set_skill("luoying-shenzhang", 50);
        set_skill("dodge", 50);
        set_skill("anying-fuxiang", 50);
        set_skill("force", 50);
        map_skill("dodge", "anying-fuxiang");
        map_skill("unarmed","luoying-zhang");

        create_family("桃花岛", 3, "弟子");

        setup();
        carry_object("/clone/misc/cloth")->wear();
}
