// yuyinzi.c
inherit NPC;

#include <ansi.h>

void create()
{
        set_name("玉音子", ({ "yuyin zi", "zi", "yuyin" }) );
        set("gender", "男性");
        set("class", "taoist");
        set("age", 45);
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);
 
        set("max_qi", 2000);
        set("max_jing",1200);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 30);
        set("combat_exp", 110000);
        set("shen_type", -1);

        set_skill("unarmed", 80);
        set_skill("sword", 100);
        set_skill("force", 100);
        set_skill("parry", 100);
        set_skill("dodge", 100);
        set_skill("taishan-sword", 100);
        set_skill("lingxu-bu", 100);
        set_skill("taishan-xinfa", 100);

        map_skill("force", "taishan-xinfa");
        map_skill("sword", "taishan-sword");
        map_skill("parry", "taishan-sword");
        map_skill("dodge", "lingxu-bu");

        create_family("泰山派", 12, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
}

