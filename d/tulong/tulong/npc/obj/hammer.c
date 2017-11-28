#include <weapon.h>
#include <ansi.h>

inherit HAMMER;

void create()
{
        set_name(HIG "碧绿" NOR+HIR "西瓜" NOR, ({ "green xigua","xigua","hammer" }) );
        set_weight(160000); // 也太重了
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "对");
                set("long", "这西瓜由精钢铸成，瓜上漆成绿黑间条之色，共有一对，系以钢链。\n");
                set("value", 3000);
                set("material", "iron");
                set("wield_msg", "$N拿出一对$n，试了试重量，然後握在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }
        init_hammer(80);
        setup();
}

