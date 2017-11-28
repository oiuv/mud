#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(HIW "两极剑" NOR,({ "liangji jian", "liangji", "jian", "sword" }) );
        set_weight(6500);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "一柄锋利的长剑，剑脊中分，一半呈火红色，另"
                                "一半却白如寒雪。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "一声长叹，抽出一柄红白相间的"
                                 "长剑握在手中。\n" NOR);
                set("unwield_msg", HIW "$N" HIW "一声轻哼，将手中的两极剑插"
                                 "回背后。\n" NOR);
                set("stable", 100);
        }
        init_sword(150);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
        int my_exp, ob_exp;

        if (me->query_skill("sword") < 160)
                return damage_bonus / 2;

        if (me->query_skill_mapped("sword") != "qiankun-jian" &&
            me->query_skill_mapped("sword") != "zhengliangyi-jian")
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("sword") / 14 + 2);
                return HIW "$N" HIW "反转两极剑剑身凌空劈划而出，顿时剑尖透"
                       "过数道寒芒，直逼得$n" HIW "连连后退！\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return HIR "$N" HIR "手中两极剑中宫直进，连续刺出，剑尖顿时"
                       "透出一道炽热的剑气，直涌$n" HIR "而去！\n" NOR;
        }
        return damage_bonus;
}
