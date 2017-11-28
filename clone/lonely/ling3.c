#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(NOR + YEL "圣火令" NOR, ({ "shenghuo ling", "shenghuo", "ling" }));
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "柄");
                set("value", 10000);
                set("material", "steel");
                set("no_sell", "他奶奶的，这种破铁牌也值钱？");
                set("long", NOR + YEL "
这是一柄两尺来长的黑牌，看上去非金非铁，但质地却是坚硬
无比。整个令牌竟有若透明，令中隐隐似有火焰飞腾，实则是
令质映光，颜色变幻。令上刻得有不少波斯文，所记似乎和武
学有关，内容深奥，看来需要仔细研读一番才能够领悟。\n" NOR);
                set("wield_msg", HIR "$N" HIR "从腰间抽出一片黑黝的"
                                 "铁牌握在手中。\n" NOR);
                set("unwield_msg", HIR "$N" HIR "单手一抖，已将圣火"
                                 "令插回了腰间。\n" NOR);
                set("skill", ([
                        "name"         : "shenghuo-ling",
                        "exp_required" : 1500000,
                        "jing_cost"    : 120,
                        "difficulty"   : 80,
                        "max_skill"    : 149,
                        "min_skill"    : 120,
                        "need"         : ([ "sanscrit" : 200 ]),
                ]));
        }
        init_sword(80);
        setup();
}
