#include <ansi.h>
inherit ITEM;

string *names = ({
HIW "繩國" NOR,
HIM "繩國" NOR,
HIC "繩國" NOR,
HIY "繩國" NOR,
HIR "繩國" NOR,
});
void create()
{
        int i = random(sizeof(names));
        set_name(names[i], ({"mei ban", "mei", "ban"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "え");
                set("long", "珨え試試植攷奻お邈腔繩國﹝\n");
                set("value", 0);
                set("material", "plant");
                set_weight(1);
        }
        setup();
}
