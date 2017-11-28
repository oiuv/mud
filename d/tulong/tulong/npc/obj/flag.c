#include <weapon.h>
#include <ansi.h>

inherit CLUB;

void create()
{
        set_name(HIY"大旗"NOR, ({ "flag","qi"}) );
        set_weight(15000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "面");
                set("long", "旗上绣着一头大鹰，双翅伸展，甚是威武。\n");
                set("value", 300);
                set("material", "silk");
                set("wield_msg", "$N拿出一面$n，挥舞示意。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }
        init_club(10);
        setup();
}

