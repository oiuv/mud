// huoyan-dao.c 火焰刀

inherit SKILL;

mapping *action = ({
([      "action": "$N使出一招「钻木取火」，飞身急转，双掌向前平平拍向$n",
        "skill_name" : "钻木取火",
        "force" : 90,
        "attack": 25,
        "dodge" : 15,
        "parry" : 25,
        "lvl"   : 0,
        "damage": 40,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「祝融怀焰」，手掌如刀，斜斜劈向$n的$l",
        "skill_name" : "祝融怀焰",
        "force" : 130,
        "attack": 47,
        "dodge" : 25,
        "parry" : 31,
        "lvl"   : 30,
        "damage": 55,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「风火无边」，双掌一拍，一道内力自掌中攻向$n的$l",
        "skill_name" : "风火无边",
        "force" : 180,
        "attack": 61,
        "dodge" : 25,
        "parry" : 40,
        "lvl"   : 60,
        "damage": 65,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「六道轮回」，双手合十，当头劈向$n",
        "skill_name" : "六道轮回",
        "force" : 240,
        "attack": 75,
        "dodge" : 20,
        "parry" : 47,
        "lvl"   : 90,
        "damage": 70,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「双龙吐焰」，双掌一错，两道内力交叉攻向$n的$l",
        "skill_name" : "双龙吐焰",
        "force" : 300,
        "attack": 80,
        "dodge" : 30,
        "parry" : 56,
        "lvl"   : 120,
        "damage": 80,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「刀山火海」，双掌向下斜拍，顿时万千道内力从四面八方攻向$n",
        "skill_name" : "刀山火海",
        "force" : 350,
        "attack": 91,
        "dodge" : 35,
        "parry" : 62,
        "lvl"   : 140,
        "damage": 85,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「白佛光度」，左臂回收，右掌引内力直刺$n的$l",
        "skill_name" : "白佛光度",
        "force" : 370,
        "attack": 102,
        "dodge" : 37,
        "parry" : 78,
        "lvl"   : 160,
        "damage": 90,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「火内莲花」，双掌微并，两臂前伸，一道内劲如排山倒海般攻向$n",
        "skill_name" : "火内莲花",
        "force" : 400,
        "attack": 110,
        "dodge" : 45,
        "parry" : 84,
        "lvl"   : 180,
        "damage": 109,
        "damage_type" : "瘀伤",
]),
});


int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo)
{
	return combo == "dashou-yin" ||
	       combo == "yujiamu-quan";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练火焰刀必须空手。\n");

	if ((int)me->query("max_neili") < 1200)
		return notify_fail("你的内力不够。\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功火候太浅。\n");

        if (me->query_skill("strike", 1) < me->query_skill("huoyan-dao", 1))
                return notify_fail("你的基本掌法火候有限，无法领会更高深的火焰刀法。\n");

	return 1;
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
        level = (int) me->query_skill("huoyan-dao",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	// object weapon;

	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练火焰刀必须空手。\n");

	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力不够，练不了火焰刀。\n");

	if ((int)me->query("neili") < 70)
		return notify_fail("你的内力不够，练不了火焰刀。\n");

	me->receive_damage("qi", 55);
        me->add("neili", -62);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"huoyan-dao/" + action;
}
