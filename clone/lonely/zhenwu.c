#include <weapon.h>
#include <ansi.h>

inherit SWORD;

string do_wield();
string do_unwield();

void create()
{
        set_name(HIY "真武剑" NOR,({ "zhenwu jian", "jian", "sword", "zhenwu" }) );
        set_weight(1500);
        if (clonep())
                destruct(this_object());
        else {
                set("long", @LONG
这是一柄寒光闪闪的宝剑，昔年武当张真人持此剑荡妖除魔，扫尽群丑。
江湖宵小，见此剑无不心荡神摇。
LONG );
                set("unit", "把");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", (: do_wield :));
                set("unwield_msg", (: do_unwield :));
                set("stable", 100);
        }
        init_sword(200);
        setup();
}

string do_wield()
{
        object me;

        me = this_player();
        if (me->query("shen") > 10000)
        {
                me->set_temp("apply/attack", me->query_skill("sword") / 4);
                me->set_temp("apply/defense", me->query_skill("parry") / 4);
                return HIC "$N一声长啸，将$n" HIC "荡出剑鞘，霎时天地间浩气凛然。\n" NOR;
        } else
        if (me->query("shen") >= 0)
        {
                return HIC "$N一伸手，已然把$n" HIC "亮在手中。\n" NOR;
        } else
        if (me->query("shen") > -10000)
        {
                me->set_temp("apply/attack", -me->query_skill("sword") / 5);
                me->set_temp("apply/defense", -me->query_skill("parry") / 5);
                return HIG "$N战战兢兢的摸出一把$n" HIG "。\n" NOR;
        } else
        {
                return HIG "$N一声冷笑，“唰”的一声亮出了$n" HIG "。\n" NOR;
        }
}

string do_unwield()
{
        object me;

        me = this_player();
        me->delete_temp("apply/attack", me->query_skill("sword") / 4);
        me->delete_temp("apply/defense", me->query_skill("parry") / 4);
        if (me->query("shen") >= 0)
                return HIC "$N一挥手，还剑入鞘。\n" NOR;
        else
        if (me->query("shen") > -10000)
                return HIG "$N把$n" HIG "插回剑鞘，抹了抹头上的汗。\n" NOR;
        else
                return HIG "$N一晒，把$n" HIG "插回剑鞘。\n" NOR;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
//      int my_exp,ob_exp;

        if (me->is_bad() || victim->is_good())
                return - damage_bonus / 2;

        if (me->is_not_good() || victim->is_not_bad())
                return 0;

        if (me->query_skill_mapped("sword") != "taiji-jian" ||
            me->query_skill("taiji-jian", 1) < 100)
                // only increase damage
                return damage_bonus / 2;

        switch (random(4))
        {
        case 0:
                victim->start_busy(me->query_skill("sword") / 10 + 2);
                return HIC "$N" HIC "跨前一步，手中的" NOR + HIY "真武剑" NOR
                       + HIC "幻化成无数圆圈，向$n" HIC "逼去，剑法细密之极。"
                       "$n" HIC "大吃一\n惊，不知如何抵挡，只有连连后退！\n" NOR;

        case 1:
                n = me->query_skill("sowrd");
                victim->receive_damage("qi", n, me);
                victim->receive_wound("qi", n, me);
                n = victim->query("eff_jing");
                n /= 2;
                victim->receive_damage("jing", n, me);
                victim->receive_wound("jing", n / 2, me);
                return random(2) ? HIY "$N" HIY "一声长吟，手中的真武剑化作一"
                                   "到长虹，“唰”的扫过$n" HIY "而去！\n" NOR:
                                   HIY "$N" HIY "突然大声喝道：“邪魔外道，还"
                                   "不受死？”手中真武剑" HIY "忽的一抖，$n"
                                   HIY "登时觉得眼花缭乱！\n" NOR;
        }

        // double effect
        return damage_bonus;
}

