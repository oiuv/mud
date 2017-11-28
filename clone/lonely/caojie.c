#include <ansi.h>
#include <armor.h>

inherit BOOTS; 

void create()
{
        set_name(HIG "神草结" NOR, ({ "shen caojie", "shen", "caojie" }));
        set_weight(100);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "对");
                set("long", HIG "当年达摩祖师一苇渡江时所穿的草鞋。\n" NOR);
                set("wear_msg", HIG "$N" HIG "将一对神草结绑于足间。\n" NOR);
                set("remove_msg", HIG "$N" HIG "将神草结从足间取下，放回包"
                                  "囊。\n" NOR);
                set("no_sell", "这是啥？是乌拉草么？");
                set("value", 100000);
                set("material", "silk");
                set("armor_type", "feet");
                set("armor_prop/dodge", 50);
                set("armor_prop/armor", 50);
                set("stable", 100);
        }
        setup();
}
