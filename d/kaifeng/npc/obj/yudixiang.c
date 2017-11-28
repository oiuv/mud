#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "°×ÓñµñÓñ»ÊÏñ" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "×ù");
                set("long", "ÓñµÛÊÖ³ÖÓñ°æ£¬¶Ë×øÎ¢Ğ¦²»Óï¡£\n");
                set("value", 50);
        }
}

