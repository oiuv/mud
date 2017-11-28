#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(NOR + WHT "玄铁重剑" NOR, ({ "xuantie jian", "xuantie", "jian" }) );
        set_weight(28000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", NOR + WHT "一柄由玄铁铸成的无锋长剑，着手沉重无比，但是却蕴藏着极大的威力。\n" NOR);
                set("unit", "柄");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", NOR + WHT "$N" NOR + WHT "抽出$n" NOR + WHT"，仗剑而立，威风凛凛，令人肃然起敬。\n" NOR);
                set("unwield_msg", NOR + WHT "$N" NOR + WHT "仰天长叹，潜运内力，将$n" NOR + WHT "收回。\n" NOR);
                set("stable", 100);
                set("skill", ([
                        "name"         : "xuantie-jian",
                        "exp_required" : 500000,
                        "jing_cost"    : 100,
                        "difficulty"   : 100,
                        "min_skill"    : 0,
                        "max_skill"    : 30,
                ]));
        }
        init_sword(180);
        setup();
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int ap, dp;
        object weapon;
        string msg;

        if (me->query_skill_mapped("sword") != "xuantie-jian" ||
            me->query_skill("xuantie-jian", 1) < 200 ||
            me->query("neili") < 300)
                return damage_bonus / 2;

        ap = me->query_skill("sword");
        dp = victim->query_skill("parry");

        me->start_busy(1 + random(4));

        if (ap / 2 + random(ap) > dp)
        {
                
                victim->receive_damage("qi", ap * 3 / 4, me);
                victim->receive_wound("qi", ap * 3 / 4, me);

                if (! objectp(weapon = victim->query_temp("weapon")) ||
                      weapon->query("skill_type") == "pin" || 
                      (objectp(weapon = victim->query_temp("weapon")) && // 寰宇天晶不磨损
                       weapon->is_item_make() && weapon->query("material") == "tian jing"))
                            return HIR "$N" HIR "催动内力，手中" + this_object()->name() + HIR
                                   "犹如神助一般，重重地砍在$n" HIR "身上！\n" NOR;

                if (weapon->query("consistence") > 10 ||
                    weapon->is_item_make())
                {
                      msg = HIR "$N" HIR "催动内力，手中"+ this_object()->name() + HIR "犹如神助一"
                            "般，猛然回转，重重地砍在$n" HIR "的" + weapon->name() + HIR
                            "上，\n只听得“嘭~~”的一声，" + weapon->name() + HIR "顿时火花"
                            "四射，$n" HIR "只觉得胸口气血翻腾不息。\n" NOR;
                      
                      weapon->is_item_make() ? weapon->add("consistence", -1)
                                             : weapon->add("consistence", -10);

                      tell_object(victim, HIG "你的" + weapon->name() + HIG "受到了严重的损伤！\n");
                      
                      return msg;
                    
                }

                // 非自制武器损坏
                msg = HIR "$N" HIR "催动内力，手中"+ this_object()->name() + HIR "犹如神助一"
                "般，砍在$n" HIR "的" + weapon->name() + HIR
                "上，\n只听得“嘭~~”的一声，" + weapon->name() + HIR "顿时断为两截。\n" NOR;

                weapon->set_name("断掉的" + weapon->name() + NOR);
                weapon->set("no_wield", 1);
                weapon->move(environment(me));

                return msg;
        }                 
        return damage_bonus;
}
