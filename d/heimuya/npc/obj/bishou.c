#include <ansi.h>
#include <weapon.h>

inherit DAGGER;

void create()
{
        set_name(HIC "月牙匕" NOR, ({"yueya bi", "yueya", "bi", "dagger"}));
        set_weight(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", HIC "一柄做工精细的玉制匕首。\n" NOR);
                set("value", 10000);
                set("material", "stone");
        }
        init_dagger(35);
        setup();
}
