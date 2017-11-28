// meigui.c

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
        set_name(HIR "玫瑰" NOR, ({ "rose", "meigui" }));
        set_weight(10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long","一朵红色的玫瑰，花瓣里透出一股凄然。\n");
                set("value", 10);
                set("material", "plant");
                set("armor_prop/armor", 0);
                set("armor_prop/personality", 3);
                set("wear_msg", HIC "$N" HIC "轻轻地把一朵$n"
                                HIC "戴在头上，嫣然一笑。\n");
                set("remove_msg", HIC "$N" HIC "幽幽的叹了"
                                  "口气，把$n" HIC "从头上摘了下来。\n");
        }
        setup();
}

