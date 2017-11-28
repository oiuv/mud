#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(NOR + YEL "十八木偶" NOR, ({ "18 muou", "18", "muou" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "盒");
                set("long", NOR + YEL "
这是一个小木盒，盒中垫着棉花，并列着三排木偶，神情或喜
悦不禁，或痛哭流泪，或裂嘴大怒，或慈和可亲，竟无一相同。
木偶身上油着层桐油，绘满黑线，却无穴道位置。这盒木偶刻
工精巧，面目栩栩如生。竟似一门非常高深的武学。\n" NOR);
                set("value", 100000);
                set("no_sell", "你家的孩子死了？玩具也拿来卖钱。");
                set("material", "wood");
                set("skill", ([
                        "name"         : "luohan-fumogong",
                        "exp_required" : 500000,
                        "jing_cost"    : 150,
                        "difficulty"   : 100,
                        "max_skill"    : 179,
                        "min_skill"    : 0
                ]));
        }
}
