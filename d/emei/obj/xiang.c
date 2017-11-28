#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "普贤菩萨像" NOR, ({ "xiang" }));
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", YEL "这是一尊普贤菩萨像，坐八宝莲花，神圣庄严。"
                            "不过这尊菩萨\n像看起来似乎曾有被移动(move)过的"
                            "痕迹。\n" NOR);
                set("value", 50);
        }
}

