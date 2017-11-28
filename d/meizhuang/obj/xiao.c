// xiao.c
#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(HIG"绿玉洞箫"NOR, ({ "xu xiao", "xiao"}));
        set_weight(4000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一根用绿玉做成的洞箫。\n");
                set("value", 2000);
                set("material", "steel");
                set("wield_msg", "$N「唰」的一声从怀中掏出一根$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n揣回怀里。\n");
        }
        init_dagger(50);
        setup();
}

