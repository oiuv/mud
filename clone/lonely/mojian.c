#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(NOR + WHT "墨剑" NOR, ({ "mo jian", "mo", "jian" }) );
        set_weight(14000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", WHT "一柄通体墨黑的长剑，剑身透着奇异的光泽。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", WHT "只见$N" WHT "单袖轻轻一抖，手中已多了一柄通"
                                 "体墨黑的长剑。\n" NOR);
                set("unwield_msg", WHT "$N" WHT "微微一笑，将手中的墨黑长剑插回腰"
                                 "间。\n" NOR);
                set("stable", 100);
        }
        init_sword(90);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;

        if (me->query_skill_mapped("sword") != "shangqing-jian" ||
            me->query_skill("shangqing-jian", 1) < 100)
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("sword") / 12 + 1);
                return WHT "$N" WHT "反转墨剑剑身，接连划出数朵剑花，顿时剑光四射，攻得$n"
                       WHT "措手不及！\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return WHT "$N" WHT "一声冷哼，手中墨剑中宫直进，霎时一道剑气至墨剑剑尖电"
                       "射而出，贯向$n" WHT "！\n" NOR;
        }
        return damage_bonus;
}
