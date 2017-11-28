#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(MAG "Áú»Ë×ÏÖé" NOR, ({ "longhuang jian", "longhuang", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 3100000);
                set("material", "steel");
                set("long", HIW "\nÁú»Ë×ÏÖéÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" );
        }
        init_sword(160);
        setup();
}
