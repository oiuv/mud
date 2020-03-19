#include <ansi.h>
inherit ITEM;

string *names = ({
HIW "梅瓣" NOR,
HIM "梅瓣" NOR,
HIC "梅瓣" NOR,
HIY "梅瓣" NOR,
HIR "梅瓣" NOR,
});
void create()
{
        int i = random(sizeof(names));
        set_name(names[i], ({"mei ban", "mei", "ban"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "片");
                set("long", "一片刚刚从树上飘落的梅瓣。\n");
                set("value", 0);
                set("material", "plant");
                set_weight(1);
        }
        setup();
}
