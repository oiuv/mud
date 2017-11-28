#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + HIG "「溪山行旅图」" NOR, ({ "xishan xinglvtu",
                 "tu", "xishan", "xinglvtu" }));
        set_weight(600);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "册");
                set("no_sell", "我的天，你…你知道这是啥么？也拿来卖？\n");
                set("long", HIG @LONG
这是一幅极为陈旧的图画，右上角题着「北宋范中
立溪山行旅图」十字，一座高山冲天而起，墨韵凝
厚，气势雄峻之极，实是精绝之作。但见那山森然
高耸，虽是纸上的图画，也令人不由自主的兴高山
仰止之感。
LONG NOR);
                set("value", 1);
                set("material", "paper");
                set("skill", ([
                        "name"         : "drawing",
                        "exp_required" : 10000,
                        "jing_cost"    : 60,
                        "difficulty"   : 30,
                        "max_skill"    : 199,
                        "min_skill"    : 100,
                        "need"         : ([ "literate" : 200 ]),
                ]));
        }
}

