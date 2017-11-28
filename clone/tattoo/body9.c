#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "夸父图腾" NOR, ({ "kuafu tu", "kuafu", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 9000);
                set("material", "paper");
                set("tattoo_long", "夸父追日的纹样");
                set("can_tattoo", ({ "胸口", "后背", "左臂", "右臂" }));
                set("tattoo_type", ({ "根骨", "身法" }));
                set("tattoo_con", 1);
                set("tattoo_dex", 2);
        }
}
