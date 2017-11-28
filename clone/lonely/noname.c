#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(HIG "无名剑" NOR, ({ "wuming jian", "wuming", "jian" }) );
        set_weight(28000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIG "此剑长约四尺，青光闪闪，似是利器。\n乃剑魔独孤求败年轻时所持。\n" NOR);
                set("unit", "柄");
                set("value", 8000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIG "$N" NOR + WHT "抽出$n" NOR + WHT"，负手而立，一派宗师风范。\n" NOR);
                set("unwield_msg", HIG "$N" NOR + WHT "清啸一声，弹指间，将$n" NOR + WHT "收回。\n" NOR);
                set("stable", 100);
        }
        init_sword(80);
        setup();
}
