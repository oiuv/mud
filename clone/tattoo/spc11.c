#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "神农百草图" NOR, ({ "baicao tu", "baicao", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "神农氏尝百草，面带慈悲意");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "悟性", "身法" }));
                set("tattoo_int", 2);
                set("tattoo_dex", 2);
                set("tattoo_special", "herb");
                set("tattoo_spcname", "本草知识");
        }
}
