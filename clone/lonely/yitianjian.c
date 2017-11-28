#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(NOR + WHT "倚天剑" NOR, ({ "yitian jian", "yitian", "jian", "sword" }) );
        set_weight(10000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", NOR + WHT "这便与天下至尊的屠龙宝刀并称的倚天剑。\n"
                            "相传其中藏有旷世的大秘密。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", "我的天…你…你知道这是啥么？这你也敢拿来卖？");
                set("material", "steel");
                set("wield_msg", HIW "只听「嗖」的一声破空声响，号称天下第一"
                             "神兵的倚天剑已被$N" HIW "握于手中。\n" NOR);
                set("unwield_msg", HIW "$N" HIW "将倚天剑插回腰间，天地又渐渐"
                             "放出光芒。\n"NOR);
                set("stable", 100);
        }
        init_sword(250);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        victim->receive_damage("qi", me->query("str") * 4, me);
        victim->receive_wound("qi", me->query("str") * 4, me);
        return WHT "倚天剑携着刺骨风声划破天际，$n"
               WHT "只觉全身力气竟一丝丝随着剑锋涌出。\n" NOR;
}

