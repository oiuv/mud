#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(MAG "ÆßĞÇÕÈ¡¤¼ÅÃğ" NOR, ({ "ji mie", "qixingzhang", "zhang", "staff" }) );
        set_weight(22000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 2600000);
                set("material", "steel");
                set("long", HIW "\nÆßĞÇÕÈ¡¤¼ÅÃğÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" NOR);
        }
        init_staff(150);
        setup();
}

