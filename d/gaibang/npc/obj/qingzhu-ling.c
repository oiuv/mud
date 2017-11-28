#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + GRN "青竹令" NOR, ({ "qingzhu ling", "qingzhu", "ling" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "面");
                set("long", GRN "这是一面用青竹做成的令牌，凭此可向帮内"
                            "师兄挑战。\n" NOR);
                set("material", "steel");
                set("no_sell", "这是啥？也能卖钱？");
        }
}
