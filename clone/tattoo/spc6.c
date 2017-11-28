#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "千手观音图" NOR, ({ "guanyin tu", "guanyin", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "大慈大悲观世音菩萨，坐八宝莲花，千支手姿态各异");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "悟性" }));
                set("tattoo_int", 4);
                set("tattoo_special", "clever");
                set("tattoo_spcname", "天赋聪颖");
        }
}
