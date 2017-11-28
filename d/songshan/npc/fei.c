// fei.c
inherit NPC;

#include <ansi.h>

void create()
{
        set_name("费彬", ({ "fei bing", "bing", "fei" }) );
        set("nickname", "大嵩阳手");
        set("gender", "男性");
        set("class", "swordsman");
        set("age", 45);
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 30);
        set("max_qi",2000);
        set("max_jing",1200);
        set("combat_exp", 600000);
        set("shen_type", -1);

        set_skill("sword", 170);
        set_skill("force", 160);
        set_skill("parry", 160);
        set_skill("dodge", 160);
        set_skill("songshan-xinfa", 160);
        set_skill("songshan-sword", 170);
        set_skill("lingxu-bu", 160);

        map_skill("sword", "songshan-sword");
        map_skill("parry", "songshan-sword");
        map_skill("force", "songshan-xinfa");
        map_skill("dodge", "lingxu-bu");

        create_family("嵩山派", 13, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

