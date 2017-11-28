#include <ansi.h>
inherit __DIR__"pill";

void create()
{
        set_name(HIG "菩提子" NOR, ({ "puti zi", "zi", "puti" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "此万年菩提树之实，采自灵山佛祖座前，珍稀无比。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 15000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("pill_skill", "force");
                set("force_point", 40);
                set("pill_msg3", HIM "你感到内力又雄厚了一些。\n" NOR);
                set("pill_msg4", HIR "你感到内息澎湃，难以吸收药力。\n" NOR);
        }
        setup();
}
