#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + HIR "雷火寒晶" NOR, ({"leihuo hanjing", "leihuo", "hanjing", "jing"}));
        set_weight(4500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "集天地之灵气而聚成的晶体，可铸一切神兵利器。\n" NOR);
                set("unit", "块");
                set("value", 10000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", NOR + HIR "雷火寒晶" NOR);
                set("can_make", ({ "剑", "刀", "锤", "短兵", "箫", "棍", "杖" }));
                set("power_point", 70);
        }
}

int query_autoload()
{
        return 1;
}

