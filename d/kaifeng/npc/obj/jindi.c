#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIY "金笛" NOR, ({ "jin di", "jin", "di" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", HIY "一根由纯金打铸的笛子，在阳光下闪闪生辉。\n" NOR);
                set("value", 25000);
                set("material", "steel");
                set("wield_msg", HIY "$N" HIY "从腰间抽出一根金笛握在手中，轻轻玩弄。\n" NOR);
                set("unwield_msg", HIY "$N" HIY "微微一笑，将手中的金笛插回腰间。\n" NOR);
        }
        init_sword(30);
        setup();
}
