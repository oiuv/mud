// dashou-yin.c 密宗大手印

inherit SKILL;

mapping *action = ({
([      "action" : "$N使出一招「莲花合掌印」，双掌合十，直直撞向$n的前胸",
        "skill_name" : "莲花合掌印",
        "force" : 120,
        "attack": 25,
        "dodge" : 10,
        "lvl" : 0,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「合掌观音印」，飞身跃起，双手如勾，抓向$n的$l",
        "skill_name" : "合掌观音印",
        "force" : 170,
        "attack": 30,
        "dodge" : 15,
        "lvl" : 25,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「准提佛母印」，运力于指，直取$n的$l",
        "skill_name" : "准提佛母印",
        "force" : 220,
        "attack": 35,
        "dodge" : 5,
        "lvl" : 50,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「红阎婆罗印」，怒吼一声，一掌当头拍向$n的$l",
        "skill_name" : "红阎婆罗印",
        "force" : 250,
        "attack": 40,
        "dodge" : 25,
        "lvl" : 80,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「药师佛根本印」，猛冲向前，掌如游龙般攻向$n",
        "skill_name" : "药师佛根本印",
        "force" : 280,
        "attack": 45,
        "dodge" : 15,
        "lvl" : 100,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「威德金刚印」，伏身疾进，双掌自下扫向$n的$l",
        "skill_name" : "威德金刚印",
        "force" : 320,
        "attack": 50,
        "dodge" : 15,
        "lvl" : 120,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「上乐金刚印」，飞身横跃，双掌前后击出，抓向$n的咽"
                   "喉",
        "skill_name" : "上乐金刚印",
        "force" : 340,
        "attack": 55,
        "dodge" : 20,
        "lvl" : 140,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「六臂智慧印」，顿时劲气弥漫，天空中出现无数掌影打"
                   "向$n的$l",
        "skill_name" : "六臂智慧印",
        "force" : 360,
        "attack": 65,
        "dodge" : 25,
        "lvl" : 160,
        "damage_type" : "瘀伤",
]),
});

int valid_enable(string usage) { return usage == "hand" || usage == "parry"; }

int valid_combine(string combo)
{
	return combo=="yujiamu-quan" ||
	       combo=="huoyan-dao";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练密宗大手印必须空手。\n");

        if ((int)me->query("max_neili") < 350)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("lamaism", 1) < 20)
                return notify_fail("你对密宗心法的知识了解太少，无法理解密宗大手印。\n");

        if ((int)me->query_skill("lamaism", 1) < (int)me->query_skill("dashou-yin",1) &&
	    (int)me->query_skill("lamaism", 1) < 200)
                return notify_fail("你受密宗心法知识的知识所限，难以进一步领悟大手印。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("dashou-yin",1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的密宗大手印。\n");

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
                  level   = (int) me->query_skill("dashou-yin",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
//      object weapon;

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练「密宗大手印」必须空手。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够，练不了密宗大手印。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，练不了密宗大手印。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -61);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"dashou-yin/" + action;
}