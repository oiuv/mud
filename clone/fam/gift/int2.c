#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(HIG "青龙炼睿丹" NOR, ({ "qinglong dan", "qinglong", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "这是一颗葱绿剔透的药丸，据说吃了可以增强悟性。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 50000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "int");
                set("gift_name", "先天悟性");
                set("gift_point", 70);
                set("gift_msg", HIG "突然间你只觉灵台处一片空明，舒泰无比。\n" NOR);
        }
        setup();
}

