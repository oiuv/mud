#include <weapon.h>
#include <ansi.h>

inherit BLADE;

string do_wield();
string do_unwield();

void create()
{
        set_name(GRN "绿波香露刀" NOR, ({ "xianglu dao", "lvbo", "xianglu", "dao" }));
        set_weight(2500);
        if (clonep())
                destruct(this_object());
        else {
                set("long", GRN "一柄碧绿色的鬼头刀，刀身散发出一阵腥臭，让"
                            "人闻了几欲作呕。\n" NOR);
                set("unit", "把");
                set("value", 800000);
                set("no_sell", "什么东西？好臭，好臭，快拿走！");
                set("material", "steel");
                set("wield_msg", (: do_wield :));
                set("unwield_msg", GRN "$N" GRN "抹了抹汗，将手中所握的绿波"
                            "香露刀收回。\n" NOR);
                set("stable", 100);
        }
        init_blade(80);
        setup();
}

string do_wield()
{
        object me = this_player();

        // 得授乌老大的碧烟刀法(biyan-dao)者不受刀身毒害。
        if (me->query_skill("biyan-dao") < 1 && me->query_skill("poison") < 120)
        {
                me->affect_by("lb_poison", ([
                        "level" : 150,
                        "id"    : "wu laoda",
                        "duration" : 5 + random(5)
                ]));
        	remove_call_out("poison");
        	call_out("poison", 6, me);
                return HIB "$N" HIB "抽出柄鬼头刀，哪知刚握在手中，却发现手掌已"
                       "然浮肿，磷光闪闪。\n\n" NOR;
        } else
        if (me->query_skill("biyan-dao") < 1 && me->query_skill("poison") > 180)
        {
                return GRN "$N" GRN "抽出柄鬼头刀，哪知刚握在手中，却发现手掌已"
                       "然浮肿，磷光闪闪。\n" HIY "幸好$N" HIY "精通毒理，瞬间已"
                       "将掌中所触绿波剧毒驱之于无形。\n\n" NOR;
        } else
        if (me->query_skill("biyan-dao") < 1 && me->query_skill("poison") > 120)
        {
                me->affect_by("lb_poison", ([
                        "level" : 100,
                        "id"    : "wu laoda",
                        "duration" : 3 + random(3)
                ]));
        	remove_call_out("poison");
        	call_out("poison", 18, me);
                return HIB "$N" HIB "抽出柄鬼头刀，哪知刚握在手中，却发现手掌已"
                       "然浮肿，磷光闪闪。\n" HIC "幸好$N" HIC "知晓毒技，忙呼了"
                       "半天，好容易才化解了部分毒性。\n\n" NOR;
        } else
        {
                return GRN "$N" GRN "单手一抖，掌中已然多了柄绿光闪闪的鬼头刀。\n" NOR;
        }
}

void poison(object me)
{
        object weapon;

        if (objectp(weapon = me->query_temp("weapon"))
           && weapon->query("id") == "xianglu dao"
           && me->query_skill("poison") < 180)
	{
	        message_vision(HIB "\n$N" HIB "右手不由得一颤，原来绿波香露刀刀"
                               "身剧毒已沁入肌肤。\n" NOR, me);
                me->affect_by("lb_poison", ([
                        "level" : 300,
                        "id"    : "wu laoda",
                        "duration" : 10 + random(10)
                ]));
	       	remove_call_out("poison");
       		call_out("poison", 12, me);
	}
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
//      int my_exp, ob_exp;

        if (me->query_skill("blade") < 150)
                return damage_bonus / 2;

        switch (random(10))
        {
        case 0:
                if (! victim->is_busy())
                victim->start_busy(me->query_skill("blade") / 10 + 2);
                return GRN "$N" GRN "绿波香露刀连连挥斩，化作一道道绿芒，$n"
                       GRN "只觉一股香气扑鼻而来，不敢大意，当\n即凝神闭气，"
                       "招架顿时散乱。\n" NOR;
        case 1:
                n = me->query_skill("blade");
                victim->affect_by("lb_poison", ([
                        "level" : me->query("jiali") + random(me->query("jiali")),
                        "id"    : me->query("id"),
                        "duration" : n / 70 + random(n / 30)
                ]));
                return GRN "$N" GRN "绿波香露刀连连挥斩，化作一道道绿芒，$n"
                       GRN "只觉一股香气扑鼻而来，微一诧异，顿\n时已吸入数口"
                       "毒气。\n" NOR;
        }
        return damage_bonus;
}
