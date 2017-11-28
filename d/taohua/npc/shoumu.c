// shoumu.c ÊØÄ¹¼ÒÅ«

inherit NPC;

void create()
{
        set_name("ÊØÄ¹¼ÒÅ«", ({ "shou mu" }));
        set("age", 28);
        set("gender", "ÄĞĞÔ");
        set("long",
"ËûÊÇÌÒ»¨µºµºÖ÷·òÈËµÄÊØÄ¹¼ÒÅ«¡£\n");
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

        create_family("ÌÒ»¨µº", 3, "ÊØÄ¹µÜ×Ó");
        setup();
        carry_object("/clone/cloth/cloth")->wear();
}
