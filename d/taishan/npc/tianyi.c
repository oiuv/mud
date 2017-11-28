// tianyi.c
inherit NPC;

#include <ansi.h>

void create()
{
        set_name("天乙道人", ({ "tianyi daoren", "daoren", "tianyi" }) );
        set("gender", "男性");
        set("class", "taoist");
        set("age", 45);
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("max_qi",1200);
        set("max_jing",800);
        set("neili", 1400);
        set("max_neili", 1400);
        set("jiali", 30);
        set("shen_type", 1);
        set("combat_exp", 60000);

        set_skill("unarmed", 80);
        set_skill("sword", 80);
        set_skill("force", 80);
        set_skill("parry", 80);
        set_skill("dodge", 80);
        set_skill("taishan-sword", 80);
        set_skill("lingxu-bu", 80);
        set_skill("taishan-xinfa", 80);

        map_skill("force", "taishan-xinfa");
        map_skill("sword", "taishan-sword");
        map_skill("parry", "taishan-sword");
        map_skill("dodge", "lingxu-bu");

        create_family("泰山派", 13, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
}

