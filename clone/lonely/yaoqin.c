#include <weapon.h>
#include <music.h>
#include <ansi.h>

inherit SWORD;
inherit MI_QIN;

void create()
{
        set_name(HIW "白玉瑶琴" NOR,({ "baiyu yaoqin", "baiyu", "yaoqin", "qin" }) );
        set_weight(9000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "这是一具通体都用上等白玉雕制而成瑶琴，非常的华丽及名贵。\n" NOR);
                set("unit", "具");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "从背后缓缓取出一具白玉瑶琴，轻轻的"
                                 "合抱在手中。\n" NOR);
                set("unwield_msg", HIW "$N" HIW "微微一笑，将手中的白玉瑶琴收了起"
                                 "来，放到背后。\n" NOR);
                set("stable", 100);
        }
        init_sword(120);
        setup();
}

void init()
{
        add_action("play_qin", "play");
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
        int my_exp, ob_exp;

        if (me->query_skill_mapped("sword") != "qixian-wuxingjian" ||
            me->query_skill("qixian-wuxingjian", 1) < 100)
                return damage_bonus / 2;

        switch (random(12))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("sword") / 10 + 2);
                return HIW "$N" HIW "大喝一声，眼中精光一闪，琴音音律顿时一变，$n" HIW "霎"
                       "时觉得头晕目眩，无法再战！\n" NOR;

        case 1:
                n = me->query_skill("sword");
                victim->receive_damage("qi", n * 3 / 4, me);
                victim->receive_wound("qi", n * 3 / 4, me);
                return HIW "$N" HIW "一声冷哼，反手拂过白玉瑶琴琴身，霎时琴音变得尖锐无比，"
                       "犹如利箭一般射向$n" HIW "！\n" NOR;
        }
        return damage_bonus;
}
