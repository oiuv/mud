inherit SKILL;

mapping *action = ({
([      "action": "$N一式「黄云万里动风色，白波九道流雪山」，脚踏「巽」位，手中$w劈出九道光影扑向\n"
                  "$n的$l",
        "force" : 30,
        "attack": 25,
        "dodge" : 20,
        "parry" : 25,
        "damage": 15,
        "lvl"   : 0,
        "damage_type" : "割伤"
]),
([      "action": "$N一式「银河倒挂三石梁，香炉瀑布遥相望」，抢占「坎」位，手中$w化做片片刀光, 似\n"
                  "银河倒泻般挥向$n$l",
        "force" : 33,
        "attack": 32,
        "dodge" : 26,
        "parry" : 38,
        "damage": 18,
        "lvl"   : 20,
        "damage_type" : "割伤"
]),
([      "action": "$N一式「登高壮观天地间，大江茫茫去不黄」，闪向「震」位，手中$w化为漫天刀影，夹\n"
                  "着隐隐雷声，攻向$n$l",
        "force" : 40,
        "attack": 38,
        "dodge" : 32,
        "parry" : 43,
        "damage": 22,
        "lvl"   : 40,
        "damage_type" : "割伤"
]),
([      "action": "$N一式「山川萧条极边土，胡骑凭陵杂风雨」，神情寂寥寡欢，在「艮」位突发一刀，以力压\n"
                  "千钧之势劈向$n$l",
        "force" : 60,
        "attack": 42,
        "dodge" : 45,
        "parry" : 45,
        "damage": 26,
        "lvl"   : 60,
        "damage_type" : "割伤"
]),
([      "action": "$N一式「轮台九月风夜吼，一川碎石大如斗」，身体急速旋转，在「离」位如一团旋风，手中\n"
                  "$w唰地砍向$n的$l",
        "force" : 80,
        "attack": 45,
        "dodge" : 50,
        "parry" : 55,
        "damage": 32,
        "lvl"   : 80,
        "damage_type" : "割伤"
]),
([      "action": "$N一式「杀气三时作阵云，寒声一夜传刁斗」，占住「兑」位，手中$w带着满天杀气劈向\n"
                  "$n的$l",
        "force" : 90,
        "attack": 52,
        "dodge" : 65,
        "parry" : 55,
        "damage": 40,
        "lvl"   : 100,
        "damage_type" : "割伤"
]),
});
int valid_enable(string usage) { return (usage == "blade") || (usage == "parry"); }

int valid_learn(object me)
{
    if ((int)me->query("max_neili") < 500)
        return notify_fail("你的内力修为不够。\n");

    if ((int)me->query_skill("force") < 100)
        return notify_fail("你的内功火候太浅。\n");

    if ((int)me->query_skill("blade", 1) < (int)me->query_skill("xuanxu-dao", 1))
        return notify_fail("你的基本刀法水平有限，无法领会更高深的玄虚刀法。\n");

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
        level = (int) me->query_skill("xuanxu-dao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}
int practice_skill(object me)
{
    object weapon;

    if (! objectp(weapon = me->query_temp("weapon"))
    || (string)weapon->query("skill_type") != "blade")
        return notify_fail("你使用的武器不对。\n");

    if ((int)me->query("qi") < 60)
        return notify_fail("你的体力不够练玄虚刀法。\n");

    if ((int)me->query("neili") < 60)
        return notify_fail("你的内力不够练玄虚刀法。\n");

    me->receive_damage("qi", 45);
    me->add("neili", -43);
    return 1;
}
string perform_action_file(string action)
{
        return __DIR__"xuanxu-dao/" + action;
}

