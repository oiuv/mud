#include <ansi.h>
inherit ITEM;

void setup()
{}
void create()
{
        set_name(YEL "生死薄" NOR, ({"book"}));
        set("unit", "本");
        set("long", "一本记载人间生死的名册。\n");
        set("value", 100);
        set_weight(200);
        
        setup();
}
