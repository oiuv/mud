
#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIY "赏善" HIR "罚恶" NOR "令" NOR,({ "shangfa ling", "ling" }) );
        set_weight(1000);
        set("long", @LONG
这是一面用黄铜所铸的铜牌，正面刻着“赏善”，背面刻着“罚恶”。
LONG );
                set("unit", "面");
                set("value", 0);
                set("no_sell", 1);
                set("no_drop", 1);
                set("no_give", 1);
                set("no_get", 1);
                set("material", "steel");
                set("stable", 100);
        
        setup();
}
