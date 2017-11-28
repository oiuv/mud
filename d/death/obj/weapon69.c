#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIM "·ï»ËÇÙ" NOR, ({ "fenghuang qin", "fenghuang", "qin", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 3000000);
                set("material", "steel");
                set("long", HIW "\n·ï»ËÇÙÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" );
        }
        init_sword(160);
        setup();
}
