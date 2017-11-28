#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "慧眼图腾" NOR, ({ "huiyan tu", "huiyan", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 1500);
                set("material", "paper");
                set("tattoo_long", "一只血红色的眼睛");
                set("can_tattoo", ({ "脸部", "臀部", "左臂", "右臂" }));
                set("tattoo_type", ({ "悟性" }));
                set("tattoo_int", 1);
        }
}
