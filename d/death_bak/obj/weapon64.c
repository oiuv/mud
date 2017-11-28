#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIC "Ì«°¢" NOR, ({ "tai a", "taia", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 3600000);
                set("material", "steel");
                set("long", HIW "\nÌ«°¢ÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" );
        }
        init_sword(190);
        setup();
}
