#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(RED "ÆßĞÇÕÈ¡¤÷è÷ë»ğ" NOR, ({ "qilin huo", "qixingzhang", "zhang", "staff" }) );
        set_weight(22000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¸ù");
                set("value", 3200000);
                set("material", "steel");
                set("long", HIW "\nÆßĞÇÕÈ¡¤÷è÷ë»ğÄË¾Åñ·ÆßÓüÉñ±øÖ®Ò»¡£\n" NOR);
                set("wield_msg", HIR "$NÇáÇá¶¶³ö$n" HIR "£¬É²Ê±À×ÉùºäÃù£¬Ò»¹ÉÉ±ÆøÖ±Äô¾ÅÏö¡£\n" NOR);
        }
        init_staff(180);
        setup();
}

