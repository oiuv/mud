#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "周天星斗图" NOR, ({ "jingang tu", "jingang", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "无数星斗遍布天空，神秘悠远");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "膂力", "悟性", "根骨", "身法" }));
                set("tattoo_str", 1);                     // 对应上面的后天属性种类，增加
                set("tattoo_int", 1);                     // 相应的记号。
                set("tattoo_con", 1);
                set("tattoo_dex", 1);
                set("tattoo_special", "self");
                set("tattoo_spcname", "周天运转");
        }
}
