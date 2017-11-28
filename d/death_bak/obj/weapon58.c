#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(CYN "Ç¬À¤µ¶¡¤ÄæÇ¬À¤" NOR, ({ "ni qiankun", "qiankundao", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 4000000);
                set("material", "steel");
                set("long", HIW "\nÇ¬À¤µ¶¡¤ÄæÇ¬À¤ÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" );
        }
        init_blade(210);
        setup();
}
