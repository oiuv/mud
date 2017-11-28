#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "百鬼夜行图" NOR, ({ "baigui tu", "baigui", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "百鬼夜行，无数冤魂哀鸣恸哭，让人毛骨悚然");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "身法" }));
                set("tattoo_dex", 4);
                set("tattoo_special", "agile");
                set("tattoo_spcname", "如鬼似魅");
        }
}
