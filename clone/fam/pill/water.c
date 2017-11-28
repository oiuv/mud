#include <ansi.h>
inherit ITEM;

inherit F_LIQUID;

void create()
{
        set_name(NOR + YEL "牛皮水袋" NOR, ({ "shui dai", "shui", "dai" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "这是一支特大号的牛皮水袋，质量"
                            "相当不错。甚至可以用它来穿越沙漠。\n" NOR);
                set("unit", "支");
                set("value", 5000);
                set("max_liquid", 800);
        }
        set("liquid", ([
                "type"         : "water",
                "name"         : "清水",
                "remaining"    : 300,
                "drunk_supply" : 300,
        ]));
}
