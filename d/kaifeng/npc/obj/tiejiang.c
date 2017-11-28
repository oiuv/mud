#include <weapon.h>
#include <ansi.h>
inherit STAFF;

void create()
{
        set_name(WHT "铁桨" NOR, ({ "tie jiang", "tie", "jiang" }));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一根铁桨，举可齐眉，看来很是沉重，可攻击大片敌人。\n");
                set("value", 200);
                set("material", "steel");
                set("wield_msg", "$N抽出一根$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回腰间。\n");
        }
        init_staff(30);
        setup();
}

