inherit F_UNIQUE;
#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(HIW "圣火令" NOR, ({ "shenghuo ling", "ling" }) );
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else
        {
                set("unit", "把");
                set("value", 10000);
                set("material", "steel");
                set("no_sell", "他奶奶的，这种破铁牌也值钱？");
                set("long", CYN "这是一柄两尺来长的黑牌，非金非铁。质"
                            "地坚硬无比，似透明，令\n中隐隐似有火焰飞"
                            "腾，实则是令质映光，颜色变幻。令上刻得有"
                            "不\n少波斯文，似乎和武学有关，内容深奥，"
                            "看来要仔细研读一番才行。\n" NOR);
                set("wield_msg", HIR "$N" HIR "“唰”的一声，从腰间抽"
                                 "出一片黑黝的铁牌握在手中。\n" NOR);
                set("unwield_msg", HIR "$N" HIR "将圣火令插回腰间。\n"
                                   NOR);
                set("skill", ([
                        "name":         "shenghuo-ling",
                        "exp_required": 1500000,
                        "jing_cost":    120,
                        "difficulty":   48,
                        "max_skill":    149,
                        "min_skill":    119,
                        "need" : ([ "sanscrit" : 150 ]),
                ]) );
        }
        init_sword(80);
        setup();
}
