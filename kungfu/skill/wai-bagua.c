//wai-bagua.c 外八卦

#include <ansi.h>

inherit SKILL;

string *parry_msg = ({
        "可是却被$n利用八卦四方的巧劲轻轻御开，化解了$N这一击。\n",
        "但是被$n手中兵刃利用八卦劲巧妙地卸开。\n",
        "但是$n按照八卦方位，随手转动手中的$p，让$N只感无从下手。\n",
});

string *unarmed_parry_msg = ({
        "可是却被$n利用八卦四方的巧劲轻轻御开，化解了$N这一击。\n",
        "$n身形一转，双手按照八卦方位打出，使得$N所有的攻势全部落空。\n",
        "但是$N感觉像打到棉花上一样，力道已全被$n利用八卦劲卸去。\n",
});

string query_parry_msg(object weapon)
{
        if (weapon)
                return parry_msg[random(sizeof(parry_msg))];
        else
                return unarmed_parry_msg[random(sizeof(unarmed_parry_msg))];
}

int valid_enable(string usage)
{
        return usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("bagua-bu", 1) < 100)
                return notify_fail("你的八卦步火候还不够，不能学习外八卦。\n");

        if ((int)me->query_skill("bagua-quan", 1) < 100)
                return notify_fail("你的八卦拳火候还不够，不能学习外八卦。\n");

        if ((int)me->query_skill("bagua-zhang", 1) < 100)
                return notify_fail("你的八卦掌火候还不够，不能学习外八卦。\n");

        if ((int)me->query_skill("parry", 1) < 100)
                return notify_fail("你的基本招架技巧掌握的还不够熟练，无法学习外八卦。\n");

        if ((int)me->query_skill("parry", 1) < (int)me->query_skill("wai-bagua", 1))
                return notify_fail("你的基本招架水平有限，无法领会更高深的外八卦。\n");

        return 1;
}

int practice_skill(object me)
{
        if (me->query_skill("wai-bagua", 1) < 100)
                return notify_fail("你对外八卦神功的了解甚浅，还不足以自行锻炼。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练护体神功。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -60);
        return 1;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int) me->query_skill("wai-bagua", 1) < 100
           || ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force") + mp;
        dp = me->query_skill("parry", 1) / 2 +
             me->query_skill("wai-bagua", 1);

        if (ap / 2 + random(ap) < dp * 3 / 4)
        {
                result = ([ "damage" : -damage ]);

                switch(random(3))
                {
                case 0:
                        result += ([ "msg" : WHT "$n" WHT "身形忽然按照八卦方"
                                             "位转个不停，$N" WHT "这一招竟然"
                                             "无从下手。\n" NOR ]);
                        break;
                case 1:
                        result += ([ "msg" : WHT "$n" WHT "单掌利用八卦四方的"
                                             "巧劲轻轻一托，$N" WHT "登时拿捏"
                                             "不准力道，不禁泛起一阵有心无力"
                                             "的感觉。\n" NOR ]);
                        break;

                default:
                        result += ([ "msg" : WHT "$N" WHT "一招眼看击中了$n"
                                             WHT "，然而$n" WHT "轻轻一格，"
                                             "将$N" WHT "的攻击利用八卦巧劲"
                                             "化于无形。\n" NOR ]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(2))
                {
                case 0:
                        result = HIY "$n" HIY "轻轻挥拳阻搁，暗含八卦巧劲，可$N"
                                 HIY "精通易理，丝毫不假思索，随即反身出招。\n" NOR;
                        break;
                default:
                        result = HIY "$n" HIY "按照八卦阵方位转个不停，可却见$N"
                                 HIY "一声冷笑，顺手便是一招，恰好破尽玄机。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int query_effect_parry(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("wai-bagua", 1);
        if (lvl < 100) return 0;
        if (lvl < 150) return 20;
        if (lvl < 200) return 40;
        if (lvl < 250) return 50;
        if (lvl < 300) return 60;
        if (lvl < 350) return 70;
        return 80;
}

string perform_action_file(string action)
{
        return __DIR__"wai-bagua/" + action;
}
