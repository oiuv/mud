#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(NOR + CYN "玄铁" WHT "匕首" NOR, ({ "xuantie bishou", "xuantie", "bishou" }));
        set_weight(12000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", NOR + CYN "通体漆黑的匕首，匕脊处沁出丝丝寒"
                            "意。\n" NOR);
                set("unit", "柄");
                set("no_sell", "这柄匕首你自个留着吧。");
                set("value", 100000);
                set("material", "xuantie");
                set("wield_msg", HIR "$N" HIR "抽出一柄黑黝黝的匕首拿在"
                                 "手中，顿时一阵寒气扑面而来。\n" NOR);
                set("unwield_msg", HIR "$N" HIR "将手中的匕首插回靴中。\n" NOR);
                set("stable", 100);
        }
        init_dagger(150);
        setup();
}
