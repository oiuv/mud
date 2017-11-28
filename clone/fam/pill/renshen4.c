#include <ansi.h>
inherit __DIR__"pill";

void create()
{
        set_name(HIR "千年参心丹" NOR, ({ "shenxin dan", "shenxin", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "由千年人参混合数种珍贵药材所炼制的灵药。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 30000);
                set("base_weight", 100);
                set("only_do_effect", 1);
                set("pill_skill", "force");
                set("pill_point", 40000);
                set("force_point", 100);
                set("pill_msg1", HIR "你只觉一股暖气散布全身，说不出的舒服受用。\n" NOR);
                set("pill_msg2", HIY "你只觉一股热流涌上，内息得到了完全的补充。\n" NOR);
        }
        setup();
}
