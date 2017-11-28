#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "白天目磁碗" NOR, ({ "baitianmu ciwan", "ciwan", "bai" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIW "纯白无瑕,薄如纸的上佳瓷器。\n" NOR);
                set("value", 1500);
        }
}