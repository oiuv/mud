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

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int ap, dp;
        int n;

        ap = me->query_skill("sword");
        dp = victim->query_skill("dodge");

        if (me->query_skill_mapped("sword") != "shenghuo-ling" ||
            me->query_skill("shenghuo-ling", 1) < 100 ||
            ap / 2 + random(ap) < dp)
                return damage_bonus / 2;

        switch (random(3))
        {
        case 0:
                if (! victim->is_busy())
                      victim->start_busy(me->query_skill("sword") / 10 + 4);
                return HIY "$N" HIY "怒喝一声，圣火令犹如灵蛇一般，蜿蜒游动，泛起淡淡金光，竟"
                       "将$n" HIY "笼罩在金光幻影之下。\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 2 / 3, me);
                victim->receive_wound("qi", n * 2 / 3, me);
                return  HIY "$N" HIY "飞身而起，圣火令自天而下，犹如灵蛇般地舞动着卷向$n" HIY
                        "周身各处大穴！\n" NOR;

        }
        return damage_bonus;
}
