#include <ansi.h>

#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(WHT "柔丝索" NOR,({ "rousi suo", "suo", "rousi" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "卷");
                set("value", 200000);
                set("no_sell", 1);
                set("long", HIW "一卷非常柔软的细丝，乃天蚕丝所织，是星宿三宝之一。\n" NOR );
                set("wield_msg", HIW "$N" HIW "拿出一卷$n" HIW "，轻轻摊开，握在手中。\n" NOR );
                set("unwield_msg", HIW "$N" HIW "将$n" HIW "收回成卷，放回腰间。\n" NOR );
                set("material", "silk");
                set("stable", 0);
        }
        init_whip(35);
        setup();
}
