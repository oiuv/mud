#include <ansi.h>
inherit __DIR__"pill";

void create()
{
        set_name(HIG "千年灵芝" NOR, ({ "qiannian lingzhi", "qiannian",
                                        "lingzhi", "ling", "zhi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "产于高山上的珍贵药材，服用后可提升内功等级。\n" NOR);
                set("base_unit", "株");
                set("base_value", 15000);
                set("base_weight", 300);
                set("only_do_effect", 1);
                set("pill_skill", "force");
                set("skill_mapped", 1);
                set("pill_point", 35000);
                set("force_point", 5);
                set("pill_msg1", HIR "你只觉一股暖气散布全身，说不出的舒服受用。\n" NOR);
                set("pill_msg2", HIY "你只觉一股热流涌上，内息得到了完全的补充。\n" NOR);
        }
        setup();
}
