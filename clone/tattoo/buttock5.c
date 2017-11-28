#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "烛龙图腾" NOR, ({ "zhulong tu", "zhulong", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 4000);
                set("material", "paper");
                set("tattoo_long", "上古魔兽烛龙的纹样");
                set("can_tattoo", ({ "臀部", "左臂", "右臂" }));
                set("tattoo_type", ({ "悟性" }));
                set("tattoo_int", 2);
        }
}
