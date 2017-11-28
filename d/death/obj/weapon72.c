#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(YEL "ÅÌÁúÆßÉ²½£" NOR, ({ "panlong jian", "panlong", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 2000000);
                set("material", "steel");
                set("long", HIW "\nÅÌÁúÆßÉ²½£ÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" );
        }
        init_sword(130);
        setup();
}
