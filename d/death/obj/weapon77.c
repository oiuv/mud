#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(YEL "吴阳剑" NOR, ({ "wuyang jian", "wuyang", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 900000);
                set("material", "steel");
        }
        init_sword(80);
        setup();
}
