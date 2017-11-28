#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIB "淡青螺纹醢" NOR, ({ "luowen hai" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIB "淡青色，内外都有螺旋形的条纹。\n" NOR);
                set("value", 1500);
        }
}
