#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(CYN "Ç¬À¤µ¶¡¤Ç¬À¤" NOR, ({ "qian kun", "qiankundao", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 3600000);
                set("material", "steel");
                set("long", HIW "\nÇ¬À¤µ¶¡¤Ç¬À¤ÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" );
        }
        init_blade(200);
        setup();
}
