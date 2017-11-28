inherit SKILL;

mapping *action = ({
([      "action": "$N漫步提腰，一招「英雄潇洒我独行」，飘然来至$n面前，随即手中$w微微\n"
                  "颤动，剑尖疾点向$n的$l",
        "force" : 120,
        "attack": 41,
        "parry" : 40,
        "dodge" : 31,
        "damage": 10,
        "lvl"   : 0,
        "damage_type" : "刺伤",
        "skill_name"  : "英雄潇洒我独行"
]),
([      "action": "$N斜跨一步，使出一式「儿女情长只恨短」，手中$w挥舞出两道一长一短的\n"
                  "光影直刺$n的$l",
        "force" : 140,
        "attack": 52,
        "parry" : 41,
        "dodge" : 42,
        "damage": 12,
        "lvl"   : 10,
        "damage_type" : "刺伤",
        "skill_name"  : "儿女情长只恨短"
]),
([      "action": "$N一招「翩然离去不思归」，$w骤然出鞘又立刻回到剑鞘中，随即转身翩然\n"
                   "离去。$n这时才感觉到有一股劲气逼向自己的$l",
        "force" : 150,
        "attack": 58,
        "parry" : 45,
        "dodge" : 43,
        "damage": 20,
        "lvl"   : 20,
        "damage_type" : "刺伤",
        "skill_name"  : "翩然离去不思归"
]),
([      "action": "$N双手举剑向天，一招「傲立群雄无所惧」，$w带起阵阵惊雷，自上而下向\n"
                   "$n的头颅剁去",
        "force" : 170,
        "attack": 61,
        "parry" : 48,
        "dodge" : 48,
        "damage": 25,
        "lvl"   : 40,
        "damage_type" : "刺伤",
        "skill_name"  : "傲立群雄无所惧"
]),
([      "action": "$N施展出「倾城一笑万人醉」，手握$w颔首微微一笑，$n只看得一呆，却见\n"
                   "一道剑影犹如龙游般袭向自己的$l，而自己却没看清$N何时出的手",
        "force" : 190,
        "attack": 68,
        "parry" : 51,
        "dodge" : 50,
        "damage": 30,
        "lvl"   : 60,
        "damage_type" : "刺伤",
        "skill_name"  : "倾城一笑万人醉"
]),
([      "action": "$N左脚踏实，右脚虚点，一招「一曲奏毕愁肠结」，$w带着一团剑花，飘浮\n"
                   "不定地逼向$n的$l",
        "force" : 200,
        "attack": 71,
        "parry" : 55,
        "dodge" : 55,
        "damage": 35,
        "lvl"   : 80,
        "damage_type" : "刺伤",
        "skill_name"  : "一曲奏毕愁肠结"
]),
([      "action": "$N一招「处子弄箫亦多情」，左手轻抚$w，随即猛地一弹，右手随即向前一\n"
                  "递，只见一道闪烁不定的剑影迅速刺向$n的$l",
        "force" : 230,
        "attack": 78,
        "parry" : 60,
        "dodge" : 62,
        "damage": 40,
        "lvl"   : 100,
        "damage_type" : "刺伤",
        "skill_name"  : "处子弄箫亦多情"
]),
([      "action": "$N回身低首，神色黯然，一招「闻声哀怨断人肠」，$w剑尖游移不定地刺向\n"
                   "$n的$l",
        "force" : 250,
        "attack": 81,
        "parry" : 64,
        "dodge" : 65,
        "damage": 70,
        "lvl"   : 110,
        "damage_type" : "刺伤",
        "skill_name"  : "闻声哀怨断人肠"
]),
([      "action": "$N坐手掩面，一招「彼将离兮泪涟涟」，$w斜向下划出，$n正迟疑间，却见\n"
                  "$N手中的$w已反挑而上，直刺自己的咽喉",
        "force" : 280,
        "attack": 84,
        "parry" : 68,
        "dodge" : 75,
        "damage": 69,
        "lvl"   : 120,
        "damage_type" : "刺伤",
        "skill_name"  : "彼将离兮泪涟涟"
]),
([      "action": "$N忽然面露微笑，一招「随音而舞笑开颜」，右手$w一闪，舞出三团剑花刺\n"
                  "向$n的上中下三路",
        "force" : 300,
        "attack": 88,
        "parry" : 70,
        "dodge" : 78,
        "damage": 80,
        "lvl"   : 130,
        "damage_type" : "刺伤",
        "skill_name"  : "随音而舞笑开颜"
]),
([      "action": "$N左手食指疾点$w，一招「箫音有情人无情」，剑身发出一声龙吟，余音缭\n"
                  "绕，$n只觉得的胸前一闷，一阵刚猛的劲气迫向自己",
        "force" : 330,
        "attack": 91,
        "parry" : 72,
        "dodge" : 85,
        "damage": 88,
        "lvl"   : 140,
        "damage_type" : "刺伤",
        "skill_name"  : "箫音有情人无情"
]),
([      "action": "$N右手微震，一招「箫声响毕情两断」，手中$w急颤，发出一阵震耳欲聋的\n"
                  "轰鸣，刹那间飞沙走石，$n已在一团剑光的笼罩下，正勉力支撑着",
        "force" : 350,
        "attack": 94,
        "parry" : 72,
        "dodge" : 85,
        "damage": 100,
        "lvl"   : 150,
        "damage_type" : "刺伤",
        "skill_name"  : "箫声响毕情两断"
]),
});


int valid_enable(string usage)
{
        return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为不够，无法学习玉萧剑法。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法学习玉萧剑法。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习玉萧剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("yuxiao-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的玉萧剑法。\n");

    return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;

        level = (int) me->query_skill("yuxiao-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练玉箫剑法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的体力不够练玉箫剑法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -66);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yuxiao-jian/" + action;
}
