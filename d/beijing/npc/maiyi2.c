#include <ansi.h>
inherit NPC;

void create()
{
        set_name("卖艺人", ({ "maiyi ren", "ren" }));
        set("gender", "男性" );
        set("age", 25);
        set("long", "一个沿街卖艺的人。\n");
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);
        set("chat_chance", 1);
        set("chat_msg", ({
                 CYN "卖艺人大声叫道：俺给大家表演俺的绝活。\n" NOR,
        }) );       

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("silver", 10);
}
