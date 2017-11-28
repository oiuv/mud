#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIW "盘龙银绞丝" NOR, ({"yinjiao si", "yinjiao", "si"}));
        set_weight(3800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "由穹外陨星中提炼出的神秘金属炼制而成，世所罕见。\n" NOR);
                set("unit", "束");
                set("value", 9000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIW "盘龙银绞丝" NOR);
                set("can_make", ({ "护甲", "头盔", "护腕" }));
                set("power_point", 60);
        }
}

int query_autoload()
{
        return 1;
}

