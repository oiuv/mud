#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIR "「呕血谱」" NOR, ({ "ouxue pu", "pu", "ouxue" }));
        set_weight(600);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("no_sell", "嘿，这东西也值钱？\n");

                set("long", HIR @LONG
这是一本残破的棋局，记载了国手刘仲甫，在骊山
之麓给一个乡下老媪杀得大败的棋局。全数一百十
二着，杀得惊心动魄。传说刘仲甫大败之际顿时呕
血数升，因此称之为呕血谱。
LONG NOR);
                set("value", 1);
                set("material", "paper");
                set("skill", ([
                        "name"         : "chess",
                        "exp_required" : 10000,
                        "jing_cost"    : 60,
                        "difficulty"   : 30,
                        "max_skill"    : 199,
                        "min_skill"    : 100,
                        "need"         : ([ "literate" : 200 ]),
                ]));
        }
}

