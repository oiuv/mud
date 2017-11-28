#include <weapon.h>
#include <ansi.h>

inherit WHIP;

void create()
{
        set_name(HIW "柔丝索" NOR,({ "rousi suo", "suo", "rousi" }) );
        set_weight(1300);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "一根非常柔软的细丝，乃天蚕丝所织，是星宿三宝之一。\n" NOR);
                set("unit", "根");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "手臂一挥，柔丝索犹如灵蛇，蜿蜒而出。\n" NOR); 
                set("unwield_msg", HIW "$N手臂一摆，柔丝索早已经回到怀中，银光渐渐散去，天地一片昏暗。\n" NOR);
                set("stable", 100);
        }
        init_whip(100);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;

        if (me->query_skill_mapped("whip") != "chanhun-suo" ||
            me->query_skill("chanhun-suo", 1) < 100)
                return damage_bonus / 2;

        switch (random(6))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("whip") / 10 + 2);
                return HIY "$N" HIY "怒喝一声，" HIW "柔丝索" HIY "犹如灵蛇一般，蜿蜒游动，竟"
                       "将$n" HIY "笼罩在银光幻影之下。\n" NOR;

        case 1:
                n = me->query_skill("whip");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return  HIW "$N" HIW "飞身而起，柔丝索自天而下，时若惊鸿，时若游龙，竟攻向$n" HIW 
                        "周身各处大穴！\n" NOR;

        }
        return damage_bonus;
}
