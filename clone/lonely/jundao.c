#include <weapon.h>
#include <ansi.h>

inherit BLADE;

void create()
{
        set_name(WHT "闯王军刀" NOR, ({ "chuangwang jundao", "chuangwang", "jundao", "dao", "blade" }) );
        set_weight(6200);
        if (clonep())
                destruct(this_object());
        else {
                set("long", WHT "这是闯王所使用过的刀，上面刻有几行小字。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", WHT "$N" WHT "纵声大笑，从腰间抽出一柄颇为古旧的弯刀。\n" NOR);
                set("unwield_msg", WHT "$N" WHT "环顾四周，轻叹一声，将闯王军刀插回腰间。\n" NOR);
                set("stable", 100);
        }
        init_blade(120);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;

        if (me->query_skill_mapped("blade") != "chuangwang-dao" ||
            me->query_skill("chuangwang-dao", 1) < 100)
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("blade") / 12 + 2);
                return WHT "$N" WHT "一声怒喝，手中闯王军刀横劈而出，刀势凛冽，顿时将$n"
                       WHT "逼退数步！\n" NOR;

        case 1:
                n = me->query_skill("blade");
                victim->receive_damage("qi", n / 2, me);
                victim->receive_wound("qi", n / 2, me);
                return WHT "$N" WHT "横转手中闯王军刀，刀锋顿时勾勒出一道凌厉的劲芒，直"
                       "涌$n" WHT "而去！\n" NOR;
        }
        return damage_bonus;
}
