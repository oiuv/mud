// wangwu.c 王五

inherit NPC;

void create()
{
        set_name("王五", ({ "wang wu", "wang" }));
        set("long",
                "他大约二十多岁，精明能干，笑嘻嘻的和蔼可亲。但却嫉恶如仇，性如烈火。\n");
        set("gender", "男性");
        set("age", 25);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 35);
        set("con", 27);
        set("dex", 28);

        set("inquiry",([
            "here"   : "这里当然就是侠客岛啦",
            "侠客行" : "往南面走，进山后就明白了",
        ]) );
        set("max_qi", 2000);
        set("qi", 2000);
        set("max_jing", 2000);
        set("jing", 2000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 3000000);
        set("score", 60000);

        set_skill("force", 150);
        set_skill("taiji-shengong", 150);
        set_skill("dodge", 150);
        set_skill("lingxu-bu", 150);
        set_skill("unarmed", 150);
        set_skill("taiji-quan", 200);
        set_skill("parry", 150);
        set_skill("sword", 150);
        set_skill("taiji-jian", 200);
        set_skill("taoism", 100);
        set_skill("literate", 100);

        map_skill("force", "taiji-shengong");
        map_skill("dodge", "lingxu-bu");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-jian");
        map_skill("sword", "taiji-jian");

        create_family("侠客岛", 0, "弟子");
        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/whiterobe")->wear();
}
