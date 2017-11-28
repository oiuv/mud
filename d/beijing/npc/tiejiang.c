#include <ansi.h>
inherit "/inherit/char/smith.c";

void create()
{
        set_name("铁匠", ({ "tie jiang", "tie", "jiang" }) );
        set("gender", "男性" );
        set("age", 37);
        set("long",
                "一个皮肤黝黑的中年打铁匠。\n");
        set("shen_type", 1);
        set("combat_exp", 20000);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("attitude", "peaceful");
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "铁匠擦了擦汗，又继续卖力的打着铁。\n" NOR,
        }) );       

        setup();
        carry_object("/d/beijing/npc/obj/cloth3")->wear();
        carry_object("/d/beijing/npc/obj/hammer")->wield();
        add_money("coin", 200);
}
