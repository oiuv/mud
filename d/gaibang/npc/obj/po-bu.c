#include <ansi.h>
inherit ITEM;

string long();

void create()
{
        set_name(NOR + WHT "破布" NOR, ({ "po bu", "po", "bu", "piece" }));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("long", WHT "这是一块破布，不知道有什么用。\n" NOR);
                set("material", "cloth");
                set("no_sell", "什么东西？快拿走。");
        }
}

string long()
{
        string msg;

        if (query("owner") && query("from"))
        {
                msg = WHT "这是一块从" HIW + query("from") + NOR +
                      WHT "处得来的破布，散发着一阵油臭。凭此可直"
                      "接向简长老要求升袋。只见破布上写着「今日接"
                      "受" HIW + query("owner") + NOR + WHT "挑战"
                      "技胜一筹，同意升袋」几个歪歪斜斜的字。" NOR;
        } else
                msg = query("long");

        return sort_string(msg, 54);
}
