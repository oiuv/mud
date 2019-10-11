// yi.c
inherit NPC;
inherit F_MASTER;
#include <ansi.h>;
void create()
{
        set_name("定逸师太", ({ "dingyi shitai", "shitai", "dingyi" }) );
        set("gender", "女性");
        set("class", "bonze");
        set("age", 45);
        set("attitude", "peaceful");
        set("per", 24);
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 2400);
        set("max_neili", 2400);
        set("jiali", 30);
        set("max_qi",2000);
        set("max_jing",1200);
        set("combat_exp", 1000000);
        set("shen_type", 1);

        set_skill("unarmed", 130);
        set_skill("sword", 130);
        set_skill("force", 130);
        set_skill("parry", 130);
        set_skill("dodge", 130);
        set_skill("hengshan-jian", 130);
        set_skill("lingxu-bu", 130);

        map_skill("sword", "hengshan-jian");
        map_skill("parry", "hengshan-jian");
        map_skill("dodge", "lingxu-bu");

        create_family("恒山派", 13, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/shaolin/obj/xuan-cloth")->wear();
}

