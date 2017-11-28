// 冲灵剑法
// Modified by rcwiz Oct.1997
#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "name"  : "青梅如豆",
        "action": "$N手中$w一抖，一招「青梅如豆」使出，眼中柔情万千，向$n的$l刺去",
        "force" : 70,
	"attack": 10,
	"parry" : 5,
        "dodge" : 10,
        "damage": 30,
        "lvl"   : 0,
        "damage_type":  "刺伤"
]),
([      "name"  : "雾中初见",
        "action": "$N身法陡快，一招「雾中初见」倒使上来，$w直指$n$l",
        "force" : 120,
	"attack": 20,
	"parry" : 15,
        "dodge" : 20,
        "damage": 40,
        "lvl"   : 20,
        "damage_type":  "刺伤"
]),
([      "name"  : "雨后乍逢",
        "action": "$N手中$w反转回来，似攻非攻，但剑身突转，刺向$n，心中似乎藏有万千感慨",
        "force" : 160,
	"attack": 25,
	"parry" : 20,
        "dodge" : 30,
        "damage": 45,
        "lvl"   : 40,
        "damage_type":  "刺伤"
]),
([      "name"  : "同生共死",
        "action": "$N长叹一声，跨步向前，使一招「同生共死」，手中$w斜刺而出，不守不防，誓将生死置之度外",
        "force" : 280,
	"attack": 60,
	"parry" : 10,
        "dodge" : 10,
        "damage": 50,
        "lvl"   : 60,
        "damage_type":  "刺伤"
]),
});

int valid_learn(object me)
{
    object ob;

    if ((int)me->query("max_neili") < 100)
        return notify_fail("你的内力不够，没有办法练冲灵剑法。\n");

    if (me->query_skill("huashan-jian", 1) < 100)
        return notify_fail("你华山剑法火候不够，无法练冲灵剑法。\n");

    if (! (ob = me->query_temp("weapon"))
    ||  (string)ob->query("skill_type") != "sword" )
        return notify_fail("你必须先找一把剑才能学习冲灵剑法。\n");

    if (me->query_skill("sword", 1) < me->query_skill("chongling-jian", 1))
	return notify_fail("你的基本剑法火候有限，无法领会更高深的冲灵剑法。\n");

    return 1;
}

int valid_enable(string usage)
{
    return usage=="sword" || usage=="parry";
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
	level = (int) me->query_skill("chongling-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    if ((int)me->query("qi") < 60)
        return notify_fail("你的体力太低，没有办法练习冲灵剑法。\n");

    if (me->query_skill("huashan-jian", 1) < 100)
        return notify_fail("你华山剑法火候不够，无法练冲灵剑法。\n");
                
    if ((int)me->query("neili") < 40)
        return notify_fail("你的内力不够，没有办法练习冲灵剑法。\n");

    me->receive_damage("qi", 50);
    me->add("neili", -31);
    return 1;
}
