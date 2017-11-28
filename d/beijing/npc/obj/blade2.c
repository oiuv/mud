#include <weapon.h>
#include <ansi.h>

inherit BLADE;
void create()
{
        set_name("短刀",  ({ "duan dao", "dao", "blade" }));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 10);
                set("long", "一柄锈迹斑斑的短刀，看样子值不了两个钱。\n");
                set("no_sell", "拿走，快拿走。这破铜烂铁值什么钱？");
                set("material", "steel");
        }
        init_blade(10);
        setup();
}

