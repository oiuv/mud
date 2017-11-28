// youfang.c 游方道人

#include <command.h>
#include <ansi.h>

inherit NPC;

void create()
{
        set_name("游方道人", ( {"youfang daoren","daoren","youfang" }));
        set("age",35);
        set("gender", "男性");
        set("long", "武当派游方道人．\n");
        set("attitude", "peaceful");

        set("str", 24);
        set("dex", 16);
        set("combat_exp", 80000);
        set("shen_type", 1);

        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_skill("parry", 60);
        set_skill("sword", 80);
        set_skill("force", 60);
        set_temp("apply/attack", 40);
        set_temp("apply/defense", 40);
        set_temp("apply/damage", 20);
        set_temp("apply/armor", 80);
        set("chat_chance", 5);
        create_family("武当派", 3, "弟子");

        setup();
        carry_object("/clone/weapon/changjian");
        carry_object("/d/wudang/obj/whiterobe")->wear();
}
