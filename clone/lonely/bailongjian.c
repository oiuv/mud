#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(HIW "白龙剑" NOR, ({ "bailong jian", "bailong", "jian" }) );
        set_weight(5500);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "青锋长约三尺，剑脊花纹古朴，锋口隐隐发着银泽。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "从背后「唰」的抽出一柄利剑，"
                                 "剑刃在阳光下闪闪生辉。\n" NOR);
                set("unwield_msg", HIW "$N" HIW "将手中白龙剑空舞个剑花，插"
                                 "回剑鞘。\n" NOR);
                set("stable", 100);
        }
        init_sword(150);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
//      int my_exp, ob_exp;

        if (me->query_skill_mapped("sword") != "rouyun-jian" ||
            me->query_skill("rouyun-jian", 1) < 100)
                return damage_bonus / 2;

        switch (random(10))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("sword") / 10 + 2);
                return HIW "$N" HIW "将手中白龙剑斜斜削出，剑身陡然漾起一道"
                       "白光，将$n" HIW "逼得连连后退！\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return HIW "$N" HIW "一声清啸，手中白龙剑连舞出七、八个剑花"
                       "，缤纷削向$n" HIW "周身各处！\n" NOR;
        }
        return damage_bonus;
}