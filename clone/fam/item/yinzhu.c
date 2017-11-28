#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIW "银蛛丝" NOR, ({"yinzhu si", "yinzhu", "si"}));
        set_weight(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "大雪山银蛛所产的丝，强韧坚固，极为珍贵。\n" NOR);
                set("unit", "卷");
                set("value", 10000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIW "银蛛丝" NOR);
                set("can_make", ({ "护甲", "战衣", "腰带", "护腕", "靴子", "鞭" }));
                set("power_point", 70);
        }
}

int query_autoload()
{
        return 1;
}

