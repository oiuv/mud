#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "青铜浮屠" NOR, ({ "futu" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "这是佛门中的浮屠，上面雕刻着金刚经。\n");
                set("value", 50);
        }
}
