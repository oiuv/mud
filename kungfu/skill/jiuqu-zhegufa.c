// jiuqu-zhegufa.c 九曲折骨法
// Edit By Vin On 22/2/2001

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N一声冷哼，以掌化爪，五指如钩，直逼$n的膻中要穴",
        "force" : 130,
        "attack": 65,
        "dodge" : 5,
        "damage": 85,
        "parry" : 40,
        "lvl"   : 0,
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手虚晃，右手上下直击，反扣$n的肩井大穴",
        "force" : 160,
        "attack": 72,
        "dodge" : 10,
        "damage": 92,
        "parry" : 42,
        "lvl"   : 30,
        "damage_type" : "瘀伤"
]),
([      "action": "$N一矮身，掌指齐出，拍拿并施，拿向$n的三路要害",
        "force" : 180,
        "attack": 81,
        "dodge" : 15,
        "parry" : 45,
        "damage": 130,
        "lvl"   : 60,
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手鹰抓，右手蛇举，身形微微晃动，双手疾扣$n的中节大脉",
        "force" : 230,
        "attack": 85,
        "dodge" : 20,
        "parry" : 46,
        "damage": 140,
        "lvl"   : 90,
        "damage_type" : "瘀伤"
]),
([      "action": "$N上前一步，四面八方出现无数掌影，一爪突出，抓向$n的胸口",
        "force" : 240,
        "attack": 93,
        "dodge" : 25,
        "parry" : 54,
        "damage": 150,
        "lvl" : 120,
        "damage_type" : "内伤"
]),
([      "action": "$N大喝一声，两手环扣，全身关节啪啪作响，击向$n的$l",
        "force" : 270,
        "attack": 98,
        "dodge" : 30,
        "parry" : 58,
        "damage": 160,
        "lvl" : 150,
        "damage_type" : "内伤"
]),
([      "action": "$N身形一展，十指齐伸，遮天蔽日般地笼罩$n的全身要穴",
        "force" : 330,
        "attack": 101,
        "dodge" : 35,
        "parry" : 62,
        "damage": 170,
        "lvl" : 180,
        "damage_type" : "内伤"
]),
([      "action": "$N岳立霆峙，在一阵暴雷声中，双手同时拍向$n的全身各处",
        "force" : 380,
        "attack": 127,
        "dodge" : 50,
        "parry" : 65,
        "damage": 180,
        "lvl" : 210,
        "damage_type" : "内伤"
])
});

int valid_enable(string usage)
{
        return usage == "hand" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练九曲折骨法必须空手。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，无法学九曲折骨法。\n");

        if ((int)me->query("max_neili") < 2800)
                return notify_fail("你的内力太弱，无法练九曲折骨法。\n");

        if ((int)me->query_skill("hand", 1) < 180)
                return notify_fail("你的基本手法火候不够，无法学九曲折骨法。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("jiuqu-zhegufa", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的九曲折骨法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("jiuqu-zhegufa",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("九曲折骨法必须空手练习。\n");

        if ((int)me->query("qi") < 120)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你的内力不够练九曲折骨法。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -100);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        string *limbs;
        string  limb;

        if (damage_bonus < 200) return 0;

        if (damage_bonus / 5 > victim->query_dex())
        {
                if (arrayp(limbs = victim->query("limbs")))
                        limb = limbs[random(sizeof(limbs))];
                else
                        limb = "罩门";

                victim->receive_wound("qi", (damage_bonus - 200) / 2);
                return HIR "$n" HIR "稍一迟疑，只见$N" HIR "手正搭在自己" + limb +
                       "上，只听「咔嚓」一声脆响，此处骨骼顿时应声而碎！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"jiuqu-zhegufa/" + action;
}
