// likexiu.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("李可秀", ({ "li kexiu", "li", "kexiu"}) );
        set("title", "杭州提督");
        set("gender", "男性");
        set("age", 54);
        set("long",
                "李可秀一身军功而成封疆大吏，一身武功自然不容轻视。\n");
        set("combat_exp", 150000);
        set("shen_type", -1);
        set("attitude", "heroism");

        set_skill("unarmed", 75);
        set_skill("blade", 75);
        set_skill("parry", 70);
        set_skill("dodge", 70);

        setup();

        carry_object("/d/city/obj/gangdao")->wield();
        carry_object("/d/city/obj/tiejia")->wear();

        add_money("coin", 30);
}

