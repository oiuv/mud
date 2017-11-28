#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "锦绣山河图" NOR, ({ "shanhe tu", "shanhe", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "万里江山，波澜壮阔，气势恢弘磅礴之极");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "根骨" }));
                set("tattoo_con", 4);
                set("tattoo_special", "mystery");
                set("tattoo_spcname", "玄黄聚纳");
        }
}
