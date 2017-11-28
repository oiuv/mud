#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + WHT "「率意帖」" NOR, ({ "shuaiyi tie", "tie", "shuaiyi" }));
        set_weight(600);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "册");
                set("no_sell", "我的天，你…你知道这是啥么？也拿来卖？\n");
                set("long", WHT @LONG
这便是唐朝张旭的率意帖，但见帖上的草书大开大
阖，便如一位武林高手展开轻功，窜高伏低，虽然
行动迅捷，却不失高雅的风致。帖尾写满了题跋盖
了不少图章，料想此帖的是非同小可。
LONG NOR);
                set("value", 1);
                set("material", "paper");
                set("skill", ([
                        "name"         : "calligraphy",
                        "exp_required" : 10000,
                        "jing_cost"    : 60,
                        "difficulty"   : 30,
                        "max_skill"    : 199,
                        "min_skill"    : 100,
                        "need"         : ([ "literate" : 200 ]),
                ]));
        }
}

