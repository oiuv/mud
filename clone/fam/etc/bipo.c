inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIW "±ÌÆÇ±ù¾§" NOR, ({"bipo bingjing", "bipo", "bingjing"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "¾§Ó¨ÌÞÍ¸µÄº®¾§£¬º®Æø´Ì¹Ç£¬ÄËÌì½ç¼«Æ·¡£\n" NOR);
                set("unit", "¿é");
                set("value", 12000);
                set("can_be_enchased", 1);
                set("magic/type", "cold");
                set("magic/power", 55 + random(16));
        }
        setup();
}

int query_autoload()
{
        return 1;
}

