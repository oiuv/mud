#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIC "胭脂碧波瓠" NOR, ({ "bibo hai", "bibo", "hai"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIC "碧绿的瓷壁上留着点点胭脂"
                            "红,乃是磁中绝品。\n" NOR);
                set("value", 1500);
        }
}
