// liuqin.c
inherit NPC;
inherit F_MASTER;
#include <ansi.h>;
void create()
{
        set_name("刘芹", ({ "liu qin", "qin" }) );
        set("gender", "男性");
        set("class", "swordsman");
        set("long", "他是刘正风的最宠爱的小儿子。\n");
        set("age", 15);
        set("attitude", "peaceful");
        set("per", 29);
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 10);
        set("max_qi",300);
        set("max_jing",300);
        set("combat_exp", 15000);
        set("shen_type", 1);

        set_skill("unarmed", 20);
        set_skill("sword", 50);
        set_skill("force", 20);
        set_skill("parry", 20);
        set_skill("dodge", 20);
        set_skill("henshan-jian", 50);
        set_skill("henshan-shenfa", 20);

        map_skill("sword", "henshan-jian");
        map_skill("parry", "henshan-jian");
        map_skill("dodge", "henshan-shenfa");

        create_family("衡山派", 16, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/male1-cloth")->wear();
}

