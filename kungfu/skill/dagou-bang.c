#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N使出一招「棒打双犬」，手中$w化作两道青光砸向$n的$l",
        "force" : 280,
        "attack": 98,
        "dodge" : 120,
        "parry" : 100,
        "damage": 80,
        "damage_type": "挫伤"
]),
([      "action": "$N手中$w左右晃动，一招「拨草寻蛇」向$n的$l攻去",
        "force" : 300,
        "attack": 100,
        "dodge":  100,
        "parry" : 120,
        "damage": 100,
        "damage_type": "挫伤"
]),
([      "action": "$N举起$w，居高临下使一招「打草惊蛇」敲向$n的$l",
        "force" : 290,
        "attack": 99,
        "dodge":  120,
        "parry" : 100,
        "damage": 70,
        "damage_type": "挫伤"
]),
([      "action": "$N施出「拨狗朝天」，$w由下往上向$n撩去",
        "force" : 310,
        "attack": 105,
        "dodge" : 80,
        "parry" : 140,
        "damage": 90,
        "damage_type": "挫伤"
]),
});

int valid_enable(string usage)
{
        return usage == "staff" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query("dex") < 26)
                return notify_fail("你的先天身法太差，无法学习打狗棒法。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为不足，无法学习打狗棒法。\n");

        if ((int)me->query_skill("staff", 1) < 100)
                return notify_fail("你的基本杖法不够，无法学习打狗棒法。\n");

        if ((int)me->query_skill("staff", 1) < (int)me->query_skill("dagou-bang", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的打狗棒法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int) me->query_skill("dagou-bang", 1) < 100
           || ! me->query_temp("feng_zijue")
           || ! (weapon = me->query_temp("weapon"))
           || ! living(me)
           || weapon->query("skill_type") != "staff")
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force") + mp;
        dp = me->query_skill("parry", 1) / 2 +
             me->query_skill("dagou-bang", 1);

        if (ap / 2 + random(ap) < dp * 3 / 4)
        {
                result = ([ "damage": -damage ]);

                switch (random(2))
                {
                case 0:
                        result += (["msg" : HIG "$n" HIG "巧妙的施展打狗棒「" HIY "封"
                                            HIG "」字诀，手中" + weapon->name() + HIG
                                            "左封右闭，使得$N" HIG "的攻势全然落空。\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIG "$n" HIG "急转手中" + weapon->name() +
                                            HIG "，打狗棒「" HIY "封" HIG "」字诀发挥"
                                            "得淋漓尽致，顿将$N" HIG "的招式驱于无形。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(2))
                {
                case 0:
                        result = HIY "$n" HIY "蓦地施展出打狗棒「封」字"
                                 "诀，可是$N" HIY "理也不理，当即挥招直"
                                 "入，进袭$n" HIY "。\n" NOR;
                        break;
                default:
                        result = HIY "$n" HIY "急转手中" + weapon->name() +
                                 HIY "，左封右闭，然而$N" HIY "却是精演"
                                 "天数，丝毫不受$n" HIY "的迷惑。\n"  NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练打狗棒法。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练打狗棒法。\n");

        me->receive_damage("qi", 75);
        me->add("neili", -80);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"dagou-bang/" + action;
}
