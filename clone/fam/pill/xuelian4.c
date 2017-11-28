#include <ansi.h>
inherit __DIR__"pill";

void create()
{
        set_name(HIC "千年雪莲膏" NOR, ({ "xuelian gao", "gao", "xuelian", "lian" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIC "由千年雪莲混合数种珍贵药材所炼制的灵药。\n" NOR);
                set("base_unit", "盒");
                set("base_value", 30000);
                set("base_weight", 100);
                set("only_do_effect", 1);
                set("pill_skill", "dodge");
                set("pill_point", 50000);
                set("force_point", 100);
                set("pill_msg1", HIW "你只感到清凉之意散布全身，说不出的舒服受用。\n" NOR);
                set("pill_msg2", HIC "你只觉灵台处清欣无比，精力得到了完全的补充。\n" NOR);
        }
        setup();
}
