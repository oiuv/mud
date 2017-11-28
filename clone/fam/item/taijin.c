#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + YEL "钛金竹" NOR, ({"taijin zhu", "taijin", "zhu"}));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", YEL "千年一遇的奇竹，吸取了天魂地魄之精，坚如玄铁。\n" NOR);
                set("unit", "根");
                set("value", 8000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + YEL "钛金竹" NOR);
                set("can_make", ({ "箫", "棍", "杖", "鞭" }));
                set("power_point", 50);
        }
}

int query_autoload()
{
        return 1;
}

