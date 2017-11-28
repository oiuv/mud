inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIR "火之精灵·火" NOR, ({"huo jingling", "huo", "jingling"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "火神祝融之宝物，拥有着火属性的最高力量。\n" NOR);
                set("unit", "块");
                set("value", 12000);
                set("can_be_enchased", 1);
                set("magic/type", "fire");
                set("magic/power", 90 + random(11));
        }
        setup();
}

int query_autoload()
{
        return 1;
}

