#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "蚩尤图腾" NOR, ({ "chiyou tu", "chiyou", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 9000);
                set("material", "paper");
                set("tattoo_long", "魔神蚩尤的纹样");
                set("can_tattoo", ({ "胸口", "后背", "左臂", "右臂" }));
                set("tattoo_type", ({ "膂力", "身法" }));
                set("tattoo_str", 1);
                set("tattoo_dex", 2);
        }
}
