#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "怒目金刚图" NOR, ({ "jingang tu", "jingang", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "金刚怒目而视，神威凛凛");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "膂力", "根骨" }));
                set("tattoo_str", 2);
                set("tattoo_con", 2);
                set("tattoo_special", "might");
                set("tattoo_spcname", "狂暴铁拳");
        }
}
