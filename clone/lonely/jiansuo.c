#include <weapon.h>
#include <ansi.h>

inherit WHIP;

void create()
{
        set_name(HIW "剑盾珠索" NOR,({ "jiandun zhusuo", "jiandun", "zhusuo",
                                       "suo", "whip" }) );
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "一根通体银白的长索，索头上系有一个钢球。\n" NOR);
                set("unit", "根");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "从腰间取出一卷银白色的长索，“啪"
                                 "”地凌空抽打了一下。\n" NOR);
                set("unwield_msg", HIW "$N" HIW "微微一笑，将手中剑盾珠索盘好，"
                                 "放回腰间。\n" NOR);
                set("stable", 100);
        }
        init_whip(100);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
//      int my_exp, ob_exp;

        if (me->query_skill_mapped("whip") != "jiandun-zhusuo" ||
            me->query_skill("jiandun-zhusuo", 1) < 100)
                return damage_bonus / 2;

        switch (random(10))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("whip") / 10 + 1);
                return HIW "$N" HIW "手中剑盾珠索一抖，长索顿时化作一道银芒，"
                       "索头钢珠直点$n" HIW "胸前要穴！\n" NOR;

        case 1:
                n = me->query_skill("whip");
                victim->receive_damage("qi", n * 2 / 3, me);
                victim->receive_wound("qi", n * 2 / 3, me);
                return HIW "只见$N" HIW "聚力于腕，便听得“飕”的一声，剑盾珠"
                       "索竟若活物一般，直袭$n" HIW "而去！\n" NOR;
        }
        return damage_bonus;
}