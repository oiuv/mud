#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIR "阎罗绸" NOR, ({ "yanluo chou", "yanluo", "chou" }));
        set_weight(1200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "闪烁着阵阵紫光的绸缎，不知由何物所织，坚韧有如玄铁。\n" NOR);
                set("unit", "张");
                set("value", 30000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIR "阎罗绸" NOR);
                set("can_make", ({ "战衣", "腰带", "护腕", "靴子", "鞭" }));
                set("power_point", 30);
        }
}

int query_autoload()
{
        return 1;
}

