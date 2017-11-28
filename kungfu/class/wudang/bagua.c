#include <command.h>
#include <ansi.h>

inherit NPC;

void create()
{
        set_name("°ËØÔµÜ×Ó", ({ "bagua dizi", "dizi", "bagua" }));
        set("age", 23);
        set("gender", "ÄÐÐÔ");
        set("long", "ÕæÎä½£Õó°ËØÔ·½Î»µÜ×Ó¡£\n");
        set("attitude", "peaceful");

        set("str", 24);
        set("dex", 16);
        set("combat_exp", 150000);
        set("shen_type", 1);

        set("max_qi", 10);
        set("max_jing", 10);

        set_skill("unarmed", 120);
        set_skill("sword", 120);
        set_skill("force", 120);

        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "°ËØÔµÜ×ÓÆëÉùßººÈ£ºÕæÎä½£Õó£¬ÌìÏÂµÚÒ»£¡\n" NOR,
        }));
        create_family("Îäµ±ÅÉ", 3, "µÜ×Ó");

        setup();
        carry_object("/clone/weapon/changjian");
        carry_object("/d/wudang/obj/baguafu")->wear();
}

void unconcious()
{
        die();
}
