#include <weapon.h>
#include <ansi.h>

inherit BLADE;

void create()
{
        set_name(NOR + YEL "厚背紫金刀" NOR,({ "houbei dao", "houbei", "dao", "blade" }) );
        set_weight(4800);
        if (clonep())
                destruct(this_object());
        else {
                set("long", YEL "这是一柄厚背紫金八卦刀，刀缝浮动着淡紫色的"
                            "光泽。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", YEL "$N" YEL "一声清啸，「唰」地一声抽出厚"
                                 "背紫金刀，一股寒气扑面涌来。\n" NOR);
                set("unwield_msg", YEL "$N" YEL "轻哼一声，将手中厚背紫金刀"
                                 "插回背后。\n" NOR);
                set("stable", 100);
        }
        init_blade(140);
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
                return YEL "$N" YEL "一声大喝，手中厚背紫金刀按照八卦方位连"
                       "连斩出，划出一道道金芒，逼得$n" YEL "连连后退！\n"
                       NOR;

        case 1:
                n = me->query_skill("blade");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return YEL "$N" YEL "手中厚背紫金刀按照八卦方位连连斩出。$n"
                       YEL "见周围刀影重重向自己聚拢，不由得心生畏\n惧，只能够"
                       "勉强作出抵挡！\n" NOR;
        }
        return damage_bonus;
}
