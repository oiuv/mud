#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(MAG "ÆßĞÇ´¸¡¤×Ï²Ô" NOR, ({ "zi cang","hammer","chui" }));
        set_weight(28000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "°Ñ");
                set("value", 2800000);
                set("material", "steel");
                set("long", HIW "\nÆßĞÇ´¸¡¤×Ï²ÔÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" NOR);
        }
        init_hammer(180);
        setup();
}


