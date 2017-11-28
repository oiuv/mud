#include <weapon.h>
#include <music.h>
#include <ansi.h>

inherit SWORD;
inherit MI_QIN;

void create()
{
        set_name(WHT "铁琴剑" NOR,({ "tieqin jian", "tieqin", "jian", "qin" }) );
        set_weight(12000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", WHT "一具雕有古朴花纹的铁琴，铁琴的一端露出一个剑柄。\n" NOR);
                set("unit", "具");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", WHT "$N" WHT "缓缓从怀中铁琴的琴脊处抽出一柄厚脊"
                                 "薄刃的长剑握在手中。\n" NOR);
                set("unwield_msg", WHT "$N" WHT "微微一笑，将手中的铁琴剑收回，插"
                                 "入铁琴中去。\n" NOR);
                set("stable", 100);
        }
        init_sword(110);
        setup();
}

void init()
{
        add_action("play_qin", "play");
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;

        if (me->query_skill_mapped("sword") != "kunlun-jian" ||
            me->query_skill("kunlun-jian", 1) < 100)
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("sword") / 12 + 2);
                return WHT "$N" WHT "一声断喝，单手猛然拂过手中铁琴，铁琴顿时发出一股尖锐的"
                       "琴音，$n" WHT "只觉头晕目眩，几欲昏厥！\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return WHT "$N" WHT "一声冷哼，手中铁琴剑一振，霎时龙吟骤起，一道剑气携着尖"
                       "锐的琴音直射$n" WHT "而去！\n" NOR;
        }
        return damage_bonus;
}
