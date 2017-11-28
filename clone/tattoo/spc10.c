#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "冥皇炼狱图" NOR, ({ "lianyu tu", "lianyu", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "七重冥王站立于炼狱白骨堆之上，无数冤魂围绕其身");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "膂力", "身法" }));
                set("tattoo_str", 2);
                set("tattoo_dex", 2);
                set("tattoo_special", "hatred");
                set("tattoo_spcname", "杀气冲霄");
        }
}
