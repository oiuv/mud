// liufuren.c
inherit NPC;
inherit F_MASTER;
#include <ansi.h>;
void create()
{
        set_name("刘夫人", ({ "liu furen", "furen" }) );
        set("gender", "女性");
        set("long", "她是刘正风的夫人。");
        set("age", 42);
        set("attitude", "peaceful");
        set("per", 23);
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        setup();

        carry_object("/clone/misc/cloth")->wear();
}

