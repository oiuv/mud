#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(NOR + YEL "洗髓再造仙丹" NOR, ({ "xisui xiandan", "xisui",
                                                  "xiandan", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", YEL "传说此丹乃是天宫中的神品，凡人吃了可以平增根骨。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 100000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "con");
                set("gift_name", "先天根骨");
                set("gift_point", 85);
                set("gift_msg", HIM "突然你浑身骨骼响个不停，但随即又平和了下来。\n" NOR);
        }
        setup();
}

