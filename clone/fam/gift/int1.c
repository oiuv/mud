#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(NOR + HIY "增慧丹" NOR, ({ "zenghui dan", "zenghui", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "这是一颗通体金黄的药丸，据说吃了可以增强悟性。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 10000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "int");
                set("gift_name", "先天悟性");
                set("gift_point", 50);
                set("gift_msg", HIG "突然间你只觉灵台处一片空明，舒泰无比。\n" NOR);
        }
        setup();
}

