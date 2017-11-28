// liyuanzhi.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("李沅芷", ({ "li yuanzhi", "li", "yuanzhi"}) );
        set("gender", "女性");
        set("age", 16);
        set("long",
                "她是杭州提督李可秀的千金，武当名宿陆菲青的入室弟子。\n");
        set("combat_exp", 200000);
        set("shen_type", 1);
        set("max_neili", 1000);
        set("neili", 1000);
        set("max_jing", 500);
        set("jing", 500);
        set("max_qi", 1000);
        set("qi", 1000);
        set("attitude", "peace");
        set("per", 26);
        set("int", 26);
        set("con", 26);
        set("str", 26);
        set("dex", 26);

        set_skill("unarmed", 75);
        set_skill("sword", 75);
        set_skill("parry", 70);
        set_skill("dodge", 70);
        set_skill("force", 70);
        set_skill("taiji-shengong", 70);
        set_skill("taiji-jian", 70);
        set_skill("taiji-quan", 70);
        set_skill("tiyunzong", 70);
        map_skill("dodge", "tiyunzong");
        map_skill("force", "taiji-shengong");
        map_skill("sword", "taiji-jian");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-jian");
        create_family("武当派", 14, "弟子");

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/fuzhou/obj/pink_cloth")->wear();

        add_money("coin", 30);
}

