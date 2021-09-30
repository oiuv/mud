//zuixunfeng.c

#include <ansi.h>

inherit ITEM;
inherit F_LIQUID;

void create()
{
    set_name(MAG"醉熏风"NOR, ({ "zui xunfeng", "xunfeng" }));
        set_weight(300);
    if (clonep())
            set_default_object(__FILE__);
    else
        {
        set("long", "一壶巴蜀佳酿"MAG+"醉熏风"NOR"，甜美醇绵。\n");
        set("unit", "壶");
        set("value", 500);
        set("max_liquid", 10);
    }
    set("liquid", ([
        "type": "alcohol",
        "name": MAG"醉熏风"NOR"佳酿",
        "remaining": 25,
            "drunk_apply": 7,
    ]) );
}
