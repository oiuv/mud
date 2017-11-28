#include <ansi.h>
inherit NPC;
void create()
{
        set_name("亡魂", ({ "ghost" }) );
        set("long", HIB "\n\n一个死者的魂魄。\n" NOR);
        set("attitude", "peaceful");
        set("title", HIB "(鬼气)" NOR);

        setup();
}

void receive_damage(string type, int n)
{
        return;
}

void receive_wound(string type, int n)
{
        return;
}
