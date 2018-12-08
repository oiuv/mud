#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIC "离" HIR "火" HIC "玄" HIW "冰" HIC "玉" NOR,
                ({"lihuo yu", "lihuo", "yu"}));
        set_weight(3400);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIC "此乃不世宝玉，玉身一半奇热，另一半却奇寒，且能自动分水离火。\n" NOR);
                set("unit", "块");
                set("value", 30000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", HIC "离" HIR "火" HIC "玄" HIW "冰" HIC "玉" NOR);
                set("can_make", "all");
                set("not_make", ({ "战衣", "腰带", "护腕", "靴子", "鞭" }));
                set("power_point", 90);
        }
}

int query_autoload()
{
        return 1;
}
