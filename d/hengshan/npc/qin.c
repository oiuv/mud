// qin.c
inherit NPC;
inherit F_MASTER;
#include <ansi.h>;
void create()
{
        set_name("秦绢", ({ "qin juan", "qin", "juan" }) );
        set("gender", "女性");
        set("class", "swordsman");
        set("age", 16);
        set("attitude", "peaceful");
        set("per", 24);
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 1400);
        set("max_neili", 1400);
        set("jiali", 30);
        set("max_qi", 1000);
        set("max_jing", 800);
        set("combat_exp", 200000);
        set("shen_type", 1);

        set_skill("unarmed", 50);
        set_skill("sword", 50);
        set_skill("force", 50);
        set_skill("parry", 50);
        set_skill("dodge", 50);
        set_skill("hengshan-jian", 50);
        set_skill("lingxu-bu", 50);

        map_skill("sword", "hengshan-jian");
        map_skill("parry", "hengshan-jian");
        map_skill("dodge", "lingxu-bu");

        create_family("恒山派", 14, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

