#include <weapon.h>
#include <ansi.h>

inherit BLADE;

void create()
{
        set_name(NOR + YEL "紫金八卦刀" NOR,({ "bagua dao", "bagua", "dao", "blade" }) );
        set_weight(4600);
        if (clonep())
                destruct(this_object());
        else {
                set("long", YEL "这是一柄厚背薄刃，紫金所铸的八卦刀，刀柄上"
                            "刻着一个“商”字。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", "这不是商剑…商爷的东西吗？小的还想多活几年"
                               "，你还是换个地方典当吧。\n");
                set("material", "steel");
                set("wield_msg", YEL "$N" YEL "一声清啸，「唰」地一声抽出紫"
                                 "金八卦刀，刀身光泽流动，煞为称奇。\n" NOR);
                set("unwield_msg", YEL "$N" YEL "轻哼一声，将手中紫金八卦刀"
                                   "插回背后。\n" NOR);
                set("stable", 100);
        }
        init_blade(120);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;

        if (me->query_skill_mapped("blade") != "bagua-dao" ||
            me->query_skill("bagua-dao", 1) < 100)
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("blade") / 10 + 2);
                return YEL "$N" YEL "一声大喝，手中紫金八卦刀按照八卦方位连"
                       "连斩出，划出一道道金芒，逼得$n" YEL "连连后退！\n"
                       NOR;

        case 1:
                n = me->query_skill("blade");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return YEL "$N" YEL "手中紫金八卦刀按照八卦方位连连斩出。$n"
                       YEL "顿见周围刀影重重向自己聚拢，甚难抵挡！\n" NOR;
        }
        return damage_bonus;
}
