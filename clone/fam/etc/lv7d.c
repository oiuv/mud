inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIW "如意通天镢" NOR, ({"ruyi jue", "ruyi", "jue"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "纯白无暇的宝玉，传说只有在天界才会出现。\n" NOR);
                set("unit", "块");
                set("value", 50000);
                set("can_be_enchased", 1);
                set("magic/type", "cold");
                set("magic/power", 35 + random(16));

        }
        setup();
}

int query_autoload()
{
        return 1;
}

