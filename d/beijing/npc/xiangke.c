#include <ansi.h>
inherit NPC;

void create()
{
        set_name("进香客", ({ "jinxiang ke", "jinxiang", "ke" }) );
        set("gender", "男性" );
        set("age", 32);
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 10);
        set("dex", 10);
        set("con", 10);
        set("int", 10);
        set("attitude", "peaceful");
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set("chat_chance", 2);
        set("chat_msg", ({
                CYN "进香客轻轻咳嗽了一声。\n" NOR,
        }) );       

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("coin", 200);
}
