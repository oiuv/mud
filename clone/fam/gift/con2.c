#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(WHT "玄武铸骨丹" NOR, ({ "xuanwu dan", "xuanwu", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", WHT "这是一颗坚硬无比黑色丹药，据说吃了可以增强根骨。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 50000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "con");
                set("gift_name", "先天根骨");
                set("gift_point", 70);
                set("gift_msg", HIM "突然你浑身骨骼响个不停，但随即又平和了下来。\n" NOR);
        }
        setup();
}

