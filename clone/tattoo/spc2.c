#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "凤舞九天图" NOR, ({ "fengwu tu", "fengwu", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "一只浴火凤凰盘旋在云间，令人称奇");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "悟性" }));
                set("tattoo_int", 4);
                set("tattoo_special", "energy");
                set("tattoo_spcname", "聚魄还虚");
        }
}
