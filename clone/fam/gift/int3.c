#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(NOR + HIW "神恩通慧仙丹" NOR, ({ "tonghui xiandan", "tonghui",
                                                  "xiandan", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "传说此丹乃是天宫中的神品，凡人吃了可以平增悟性。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 100000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "int");
                set("gift_name", "先天悟性");
                set("gift_point", 85);
                set("gift_msg", HIG "突然间你只觉灵台处一片空明，舒泰无比。\n" NOR);
        }
        setup();
}

