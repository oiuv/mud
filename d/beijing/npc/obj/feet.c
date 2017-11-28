#include <armor.h>
inherit BOOTS;

void create()
{
        set_name("战靴", ({ "zhan xue","xue", "feet", "zhanxue", "boots" }) );
        set_weight(300);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "双");
                set("long", "一双皮靴，上等牛皮制成。靴子虽很结实，但颇轻战斗时穿非常方便适用。\n");
                set("value", 0);
                set("material", "leather");
                set("armor_prop/armor", 5);
        }
        setup();
}
