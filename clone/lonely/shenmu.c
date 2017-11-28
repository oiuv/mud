#include <weapon.h>
#include <ansi.h>

inherit CLUB;

void create()
{
        set_name(HIG "南海神木" NOR, ({ "nanhai shenmu", "nanhai", "shenmu", "club" }) );
        set_weight(6000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIG "半截蓉绿半截焦枯的木棍，看似普通，却竟如铁铸一般，坚硬无比。\n" NOR);
                set("unit", "根");
                set("value", 800000);
                set("no_sell", "靠，连晒衣竿你也拿来卖钱？");
                set("material", "steel");
                set("wield_msg", HIG "$N" HIG "拿出一根半截蓉绿半截焦枯的木棍握在手中。\n" NOR);
                set("unwield_msg", HIG "$N" HIG "将手中的南海神木挥舞个圈子，插回背上。\n" NOR);
                set("stable", 100);
        }
        init_club(160);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
        int my_exp, ob_exp;

        if (me->query_skill_mapped("club") != "jinyuan-gun"
           || me->query_skill("jinyuan-gun", 1) < 100)
                return damage_bonus / 2;

        switch (random(8))
        {
        case 0:
                n = me->query_skill("club");
                victim->receive_damage("qi", n, me);
                victim->receive_wound("qi", n, me);
                return HIG "$N" HIG "跨步上前，手中南海神木转动如轮，气势如虹，接二"
                       "连三朝$n" HIG "扫去！\n" NOR;
        }
        return damage_bonus;
}
