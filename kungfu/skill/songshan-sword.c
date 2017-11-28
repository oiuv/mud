// songshan-sword.c
// Modified by Java Sep.1998
#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "skill_name":    "万岳朝宗",
        "action":  "$N右手$w一立，举剑过顶，弯腰躬身，使一招‘万岳朝宗’正是"
                   "嫡系正宗的嵩山剑法",
        "dodge" : 10,
        "damage": 20,
        "force" : 100,
        "lvl"   : 0,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "千古人龙",
        "action":  "$N手中$w突然间剑光一吐，化作一道白虹，端严雄伟，端丽飘逸，"
                   "正是嵩山剑法的精要所在，一招‘千古人龙’向$n$l直刺过来",
        "dodge" : 20,
        "damage": 25,
        "force" : 150,
        "lvl"   : 20,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "叠翠浮青",
        "action":  "$N手中$w突然间剑光一吐，一招‘叠翠浮青’化成一道青光，气"
                   "壮雄浑，向$n$l直刺过来",
        "dodge" : 25,
        "damage": 30,
        "force" : 170,
        "lvl"   : 40,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "玉进天池",
        "action":  "$N手中$w剑光一吐，一招‘玉进天池’威仪整肃，端严雄伟，向"
                   "$n$l直刺过来",
        "dodge" : 20,
        "damage": 40,
        "force" : 210,
        "lvl"   : 60,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "开门见山",
        "action":  "$N左手向外一分，右手$w向右掠出，使的是嵩山派剑法‘开门见"
                   "山’",
        "dodge" : 15,
        "damage": 40,
        "force" : 220,
        "lvl"   : 80,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "独劈华山",
        "action":  "$N手中$w自上而下的向$n直劈下去，一招‘独劈华山’，真有石"
                   "破天惊的气势，将嵩山剑法之所长发挥得淋漓尽致",
        "dodge" : -10,
        "damage": 50,
        "force" : 230,
        "lvl"   : 100,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "天外玉龙",
        "action":  "$N手中$w刷的一剑自左而右急削过去，正是一招嵩山派正"
                   "宗剑法‘天外玉龙’。但见$w自半空中横过，剑身似曲似直，长"
                   "剑便如一件活物一般",
        "dodge" : 20,
        "damage": 65,
        "force" : 290,
        "lvl"   : 150,
        "damage_type":  "刺伤"
]),
});

int valid_learn(object me)
{
    object ob;
    if( (int)me->query("max_neili") < 150 )
        return notify_fail("你的内力不够，没有办法练嵩山剑法。\n");

    if( !(ob = me->query_temp("weapon"))
    ||      (string)ob->query("skill_type") != "sword" )
        return notify_fail("你必须先找一把剑才能练剑法。\n");

    return 1;
}

int valid_enable(string usage)
{
    return usage=="sword" || usage=="parry";
}

string query_skill_name(int level)
{
    int i;
    for(i = sizeof(action)-1; i >= 0; i--)
        if(level >= action[i]["lvl"])
            return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
    int i, level;
    level   = (int) me->query_skill("songshan-sword",1);
    for(i = sizeof(action); i > 0; i--)
        if(level > action[i-1]["lvl"])
            return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    if ((int)me->query("qi") < 30)
        return notify_fail("你的体力不足以练习嵩山剑法。\n");

    if ((int)me->query("neili") < 30 )
        return notify_fail("你的内力不够，没有办法练习嵩山剑法。\n");

    me->receive_damage("qi", 35);
    me->add("neili", -26);

    return 1;
}

string perform_action_file(string action)
{
        return __DIR__"songshan-sword/" + action;
}
