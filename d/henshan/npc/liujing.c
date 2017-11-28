// liujing.c
inherit NPC;
inherit F_MASTER;
#include <ansi.h>;
void create()
{
        set_name("刘菁", ({ "liu jing", "jing" }) );
        set("gender", "女性");
        set("class", "swordsman");
        set("long", "她是刘正风的女儿。\n");
        set("age", 17);
        set("attitude", "peaceful");
        set("per", 29);
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 10);
        set("max_qi",700);
        set("max_jing",200);
        set("combat_exp", 100000);
        set("shen_type", 1);

        set_skill("unarmed", 40);
        set_skill("sword", 80);
        set_skill("force", 40);
        set_skill("parry", 40);
        set_skill("dodge", 40);
        set_skill("henshan-jian", 80);
        set_skill("henshan-shenfa", 40);

        map_skill("sword", "henshan-jian");
        map_skill("parry", "henshan-jian");
        map_skill("dodge", "henshan-shenfa");

        create_family("衡山派", 16, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/female1-cloth")->wear();
}

