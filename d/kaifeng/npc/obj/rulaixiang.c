#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "如来佛像" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "佛教中的至尊，坐八宝莲花。\n");
                set("value", 50);
        }
}
