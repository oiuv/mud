#include <ansi.h>

inherit ITEM;

void create()
{
        object ob;
        set_name(HIW "玉瓶" NOR, ({ "yu ping" , "yu", "ping" }) );
        set_weight(150);
        set_max_encumbrance(100);
        if (clonep())
        {
                set_default_object(__FILE__);

                ob = new(__DIR__"jieyao");
                ob->move(this_object());

                ob = new(__DIR__"jieyao");
                ob->move(this_object());

                ob = new(__DIR__"jieyao");
                ob->move(this_object());
        } else
        {
                set("unit", "支");
                set("prep", "in");
                set("long", HIW "一支白玉雕制的玉瓶，瓶上的木塞已甚为古旧。\n" NOR);
                set("value", 3000);
        }
}
