inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIY "魔之心·魔" NOR, ({"mozhi xin", "mozhi", "xin"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "霎那间天地变色，万物隐匿，乃魔界至高无上的宝物，支配着魔界万物。\n" NOR);
                set("unit", "块");
                set("value", 13000);
                set("can_be_enchased", 1);
                set("magic/type", "magic");
                set("magic/power", 90 + random(11));
        }
        setup();
}

int query_autoload()
{
        return 1;
}

