#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "燕尾蝶图腾" NOR, ({ "yanweidie tu", "yanweidie", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 1500);
                set("material", "paper");
                set("tattoo_long", "一只燕尾蝶");
                set("can_tattoo", ({ "脸部" }));
                set("tattoo_type", ({ "容貌" }));
                set("tattoo_per", 3);
        }
}
