#include <ansi.h>

inherit ITEM;

string *names = ({
HIW "梅花" NOR,
HIM "梅花" NOR,
HIC "梅花" NOR,
HIY "梅花" NOR,
HIR "梅花" NOR,
});

void create()
{

        int i = random(sizeof(names));
        set_name(names[i], ({"mei hua", "mei", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", "一朵刚刚从树上飘落的梅花。\n");
                set("value", 0);
                set("material", "plant");
                set_weight(1);
        }
        setup();
}
