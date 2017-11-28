#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(WHT "大理石屏风" NOR, ({ "ping feng", "ping", "feng" }) );
        set_weight(500000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", WHT "一座大理石的屏风，上面的天然花"
                            "纹栩栩如生。\n" NOR);
                set("value", 5000000);
        }
}
