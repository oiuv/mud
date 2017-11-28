#include <ansi.h>
inherit __DIR__"pill";

void create()
{
        set_name(NOR + CYN "百年灵芝丸" NOR, ({ "lingzhi wan", "lingzhi", "wan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", CYN "由百年灵芝混合数种珍贵药材所炼制的灵药。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 20000);
                set("base_weight", 100);
                set("only_do_effect", 1);
                set("pill_skill", "force");
                set("skill_mapped", 1);
                set("pill_point", 30000);
                set("force_point", 50);
                set("pill_msg1", HIR "你只觉一股暖气散布全身，说不出的舒服受用。\n" NOR);
                set("pill_msg2", HIY "你只觉一股热流涌上，内息得到了完全的补充。\n" NOR);
        }
        setup();
}
