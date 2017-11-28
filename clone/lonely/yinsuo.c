#include <weapon.h>
#include <ansi.h>

inherit WHIP;

void create()
{
        set_name(HIW "银索" NOR + HIY "金铃" NOR,({ "yinsuo jinling", "suo", "ling",
                                                    "yinsuo", "jinling" }) );
        set_weight(1300);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "一根银色的长索，隐隐流动着金属的光"
                            "泽，看上去很是坚韧。长索的一端系着两个"
                            "金铃。\n" NOR);
                set("unit", "把");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "轻轻的从怀里取出一根"
                                 "银色的长索握在手中。\n" NOR); 
                set("unwield_msg", HIW "$N将手中银索" NOR + HIY "金"
                                 "铃" NOR + HIW "回腰间，天地又渐渐"
                                 "放出光芒。\n" NOR);
                set("stable", 50);
        }
        init_whip(150);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;

        if (me->query_skill_mapped("whip") != "yinsuo-jinling" ||
            me->query_skill("yinsuo-jinling", 1) < 100)
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("whip") / 10 + 2);
                return HIY "$N" HIY "一声娇喝，手中的" NOR + HIW "银索"
                       NOR + HIY "金铃幻出漫天鞭影，直点$n" HIY "而去！"
                       HIR "\n$n" HIR "稍一迟疑，只觉全身一麻，已被$N"
                       HIR "这招点中要穴。\n" NOR;

        case 1:
                n = me->query_skill("whip");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return  HIY "$N" HIY "一声清啸，手中" NOR + HIW "银索"
                        NOR + HIY "金铃宛如蛟龙通天，铺天盖地袭向$n"
                        HIY "！\n" NOR;
        }
        return damage_bonus;
}

