#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "托塔天王图" NOR, ({ "tianwang tu", "tianwang", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "托塔天王，站立于南天门之下，神威凛凛");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "膂力" }));
                set("tattoo_str", 4);
                set("tattoo_special", "ironskin");
                set("tattoo_spcname", "铜皮铁骨");
        }
}
