#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "九仪天尊图" NOR, ({ "tianzun tu", "tianzun", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "九仪天尊座于八宝莲花上，周身仙霞缭绕，似幻似真");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "悟性", "根骨" }));
                set("tattoo_int", 2);
                set("tattoo_con", 2);
                set("tattoo_special", "divine");
                set("tattoo_spcname", "移经易脉");
        }
}
