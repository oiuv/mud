#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「千斤翼」" NOR, ({ "medical book5", "medical", "book5" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "千斤翼乃医学宝典，介绍了各种疑难杂症的治疗方法。\n" NOR);
                set("value", 100000);
                set("no_sell", "这…这值什么钱？\n");
                set("material", "paper");
                set("skill",
                ([
                        "name" : "medical",
                        "jing_cost"  : 60,
                        "difficulty" : 50,
                        "max_skill"  : 149,
                        "min_skill"  : 120,
                ]) );
        }
}
