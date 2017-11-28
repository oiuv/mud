#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + YEL "「广陵散曲谱」" NOR, ({ "guangling san",
                 "guangling", "san" }));
        set_weight(300);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("no_sell", "广陵散？你当我不识货啊？\n");
                set("long", NOR + YEL @LONG
这是一本颇为残旧的曲谱，谱上用古隶写着「广陵
散」三字。传说此套琴谱在西晋时便已然消失，但
却不知为何今日在这里出现。
LONG NOR);
                set("value", 1);
                set("material", "paper");
                set("skill", ([
                        "name"         : "guangling-san",
                        "exp_required" : 30000,
                        "jing_cost"    : 50,
                        "difficulty"   : 40,
                        "max_skill"    : 199,
                        "min_skill"    : 0,
                        "need"         : ([ "literate" : 200 ]),
                ]));
        }
}

