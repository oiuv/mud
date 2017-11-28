#include <weapon.h>
#include <ansi.h>

inherit STAFF;

void create()
{
        set_name(NOR + WHT "九环锡杖" NOR, ({ "jiuhuan xizhang", "jiuhuan",
                                              "xizhang", "zhang" }) );
        set_weight(8000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", NOR + WHT "这是一根通体漆黑的锡杖，入手极为沉"
                            "重，非常坚韧，乃少林\n寺历代相传的圣物。有云"
                            "：铜镶铁造九连环，九节仙藤永驻颜。\n" NOR);
                set("unit", "根");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "取出九环锡杖握于手中，霎时"
                                 "金波荡漾，有若七佛随身。\n" NOR);
                set("unwield_msg", HIW "$N" WHT "微微一笑，将手中的九环锡"
                                 "杖放回包囊。\n" NOR);
                set("stable", 100);
        }
        init_staff(180);
        setup();
}
