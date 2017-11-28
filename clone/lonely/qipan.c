#include <weapon.h>
#include <ansi.h>

inherit HAMMER;

void create()
{
        set_name(NOR + WHT "玄铁棋盘" NOR,({ "xuantie qipan", "xuantie", "qipan", "pan" }) );
        set_weight(30000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", WHT "一个黑黝黝的棋盘，看起来毫不起眼。提在手中感觉非常的沉\n"
                            "重，仔细一看，整个棋盘竟然是用玄铁铸成。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", WHT "$N" WHT "从背后取出一个黑黝黝的棋盘高举在手中，霎"
                                 "时空气中竟沁入一阵寒气。\n" NOR);
                set("unwield_msg", WHT "$N" WHT "哈哈一笑，将手中的玄铁棋盘收回。\n" NOR);
                set("stable", 100);
        }
        init_hammer(160);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
        int my_exp, ob_exp;

        if (me->query_skill_mapped("hammer") != "fenglei-panfa" ||
            me->query_skill("fenglei-panfa", 1) < 100)
                return damage_bonus / 2;

        switch (random(16))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("hammer") / 10 + 2);
                return WHT "$N" WHT "跨前一步，手中玄铁棋盘配合风雷盘法一阵乱舞，$n" WHT "只"
                       "觉得眼花缭乱，不由心生畏惧！\n" NOR;

        case 1:
                n = me->query_skill("hammer");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return WHT "$N" WHT "猛的一声爆喝，手中玄铁棋盘竟然幻作一道长虹向$n" WHT "贯"
                       "去！\n" NOR;
        }
        return damage_bonus;
}
