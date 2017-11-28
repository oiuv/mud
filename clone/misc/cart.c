// cart.c
//

#include <ansi.h>

inherit ITEM;
inherit F_TRANSPORT;

void create()
{
        set_name("大车", ({ "cart" }) );
        set_weight(200000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("value", 1);
                set("long", "这是一辆普通的货车。\n");
                set("no_sell", "你还是拿到别地去吧。\n");
                set("unit", "辆");
                set("material", "wood");
                set("no_get", "好家伙，车你也想扛在肩上？\n");
        }
        setup();
}

string long()
{
        mapping goods;
        string desc;

        desc = ::long();
        if (! mapp(goods = query_temp("goods")))
                return desc;

        desc += "里面装着" + chinese_number(goods["amount"]) +
                goods["unit"] + goods["name"] + "。\n";
        return desc;
}
