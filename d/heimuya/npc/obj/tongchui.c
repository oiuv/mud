#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(YEL "铜锤" NOR, ({ "tong chui", "tong", "chui", "hammer" }));
        set_weight(15000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "对");
                set("long", YEL "这是一对由青铜铸造的大锤，显得极是沉重。\n" NOR);
                set("value", 3000);
                set("material", "steel");
                set("wield_msg", "$N振臂一挥，抡出一对沉重的$n。\n");
                set("unwield_msg", "$N将手中的$n慢慢收回。\n");
        }
        init_hammer(40);
        setup();
}
