#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(YEL "「楞伽经」" NOR, ({ "lengjia jing", "jing", "book" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "这是一本薄薄的经书，只因油布包得紧密，虽长期\n"
                            "藏在猿腹之中，书页仍然完好无损。书面上写著几\n"
                            "个弯弯曲曲的文字，你却是一个也不识得。\n" NOR);
                set("value", 10);
                set("material", "silk");
                set("skill", ([
                        "name":         "buddhism",
                        "exp_required": 1000,
                        "jing_cost":    10,
                        "difficulty":   10,
                        "max_skill":    50,
                        "min_skill":    0,
                        "need" : ([ "sanscrit" : 500 ]),
                ]) );

        }
}
