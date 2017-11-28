#include <armor.h>
#include <ansi.h>

inherit ARMOR;

void create()
{
        set_name( HIY "金环锁子甲" NOR, ({"jinhuan jia","jinhuan", "jia", "armor"}));
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", HIC"一件金线织就的宝甲．\n"NOR);
                set("material", "steel");
                set("value", 400000);
                set("armor_prop/armor", 30);
                set("armor_prop/dodge", -5);
        }
        setup();
}
