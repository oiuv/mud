#include <weapon.h>
#include <ansi.h>

inherit HAMMER;

void create()
{
        set_name(HIR "破阳神斧" NOR, ({ "poyang fu", "poyang", "fu", "axe" }) );
        set_weight(26000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIR "一柄赤红色的单手斧，非常沉重，锋沿沁出一股寒意。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIR "$N" HIR "拿出一柄巨斧提在手中，掂了掂，试试重量。\n" NOR);
                set("unwield_msg", HIR "$N" HIR "哈哈一笑，将手中的破阳神斧收回背后。\n" NOR);
                set("stable", 100);
        }
        init_hammer(160);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
        int my_exp, ob_exp;

        if (me->query_skill_mapped("hammer") != "pangu-qishi"
           || me->query_skill("pangu-qishi", 1) < 100)
                return damage_bonus / 2;

        switch (random(6))
        {
        case 0:
                n = me->query_skill("hammer");
                victim->receive_damage("qi", n, me);
                victim->receive_wound("qi", n, me);
                return HIR "$N" HIR "猛的一声爆喝，手中破阳神斧竟然幻作一道长虹向$n"
                       HIR "劈去！\n" NOR;
        }
        return damage_bonus;
}
