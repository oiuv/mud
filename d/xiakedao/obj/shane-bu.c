// shane-bu.c 赏善罚恶簿

#include <armor.h>
#include <ansi.h>

inherit NECK;

void create()
{
        set_name("赏善罚恶簿", ({ "shane bu", "bu" }));
        set("long", "这是一本赏善罚恶簿，里头记载着江湖善恶。\n");
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
        }
        setup();
}
