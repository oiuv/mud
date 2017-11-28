#include <weapon.h>
inherit STAFF;

void create()
{
        set_name("狼牙棒", ({ "langya bang", "bang" }));
        set_weight(30000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一根两头狼牙棒，约两百来斤，是件称手的重兵器。\n");
                set("value", 2000);
                set("material", "steel");
                set("wield_msg", "$N抽出一根$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回腰间。\n");
		set("shaolin",1);
        }
        init_staff(50);
        setup();
}

