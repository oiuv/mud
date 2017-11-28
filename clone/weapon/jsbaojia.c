#include <ansi.h>
#include <armor.h>

inherit ARMOR;

void create()
{
        set_name(NOR + CYN "真丝" HIY "宝甲" NOR, ({ "zhensi baojia", "zhensi", "baojia" }));
        set_weight(6000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", NOR + CYN "这是一件黑黝黝的马甲，入手沉"
                            "重，初看之下毫不起眼。\n" NOR);
                set("no_sell", "这样东西能值钱么。");
                set("value", 100000);
                set("material", "silk");
                set("armor_prop/armor", 200);
                set("stable", 100);
        }
        setup();
        move("/d/beijing/aofu_mishi");
}
