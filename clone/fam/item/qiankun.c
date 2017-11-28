#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIG "乾" HIW "坤" HIY "石" NOR, ({"qiankun shi", "qiankun", "shi"}));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一块晶莹剔透的宝石，石面光华"
                            "流转，便似活物一般。\n" NOR);
                set("unit", "块");
                set("value", 30000);
                set("item_origin", 1);
                set("material_attrib", "stone");
                set("material_name", HIG "乾" HIW "坤" HIY "石" NOR);
                set("can_make", ({ "铁掌" }));
                set("power_point", 100);
        }
}

int query_autoload()
{
        return 1;
}

