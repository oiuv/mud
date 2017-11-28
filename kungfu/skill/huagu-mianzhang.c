// huagu-mianzhang 化骨绵掌
inherit SKILL;

mapping *action = ({
([  "action" : "$N身形微晃，一招「长恨深入骨」，十指如戟，插向$n的双肩锁骨",
    "force" : 80,
    "dodge" : 10,
    "damage": 10,
    "damage_type" : "内伤",
    "lvl"   : 0,
    "skill_name" : "长恨深入骨" ,
]),
([  "action" : "$N出手如风，十指微微抖动，一招「素手裂红裳」抓向$n的前胸",
    "force" : 120,
    "dodge" : 10,
    "damage": 15,
    "damage_type" : "内伤",
    "lvl"   : 20,
    "skill_name" : "素手裂红裳" ,
]),
([  "action" : "$N双手忽隐忽现，一招「长风吹落尘」，鬼魅般地抓向$n的肩头",
    "force" : 150,
    "dodge" : 15,
    "damage": 20,
    "damage_type" : "内伤",
    "lvl"   : 40,
    "skill_name" : "长风吹落尘" ,
]),
([  "action" : "$N左手当胸画弧，右手疾出，一招「明月映流沙」，猛地抓向$n的额头",
    "force" : 190,
    "dodge" : 20,
    "damage": 20,
    "damage_type" : "内伤",
    "lvl"   : 60,
    "skill_name" : "明月映流沙" ,
]),
([  "action" : "$N使一招「森然动四方」，激起漫天的劲风，撞向$n",
    "force" : 240,
    "dodge" : 25,
    "damage": 25,
    "damage_type" : "内伤",
    "lvl"   : 80,
    "skill_name" : "森然动四方" ,
]),
([  "action" : "$N面无表情，双臂忽左忽右地疾挥，使出「黯黯侵骨寒」，十指\n"
               "忽伸忽缩，迅猛无比地袭向$n全身各处大穴",
    "force" : 260,
    "parry" : 5,
    "dodge" : 30,
    "damage": 30,
    "damage_type" : "内伤",
    "lvl"   : 100,
    "skill_name" : "黯黯侵骨寒" ,
]),
([  "action" : "$N使出「黄沙飘惊雨」，蓦然游身而上，绕着$n疾转数圈，$n正眼\n"
               "花缭乱间，$N已悄然停在$n身后，右手划出一道光圈，接着右手冲出光圈猛抓$n的后背",  
    "force" : 280,
    "parry" : 20,
    "dodge" : 20,
    "damage": 35,
    "damage_type" : "内伤",
    "lvl"   : 120,
    "skill_name" : "黄沙飘惊雨" ,
]),
([  "action" : "$N突然双手平举，$n一呆，正在猜测间，便见$N嗖的一下将双手\n"
               "收回胸前，接着一招「白骨无限寒」，五指如钩，直抓向$n的腰间",
    "force" : 300,
    "dodge" : 35,
    "parry" : 25,
    "damage": 40,
    "damage_type" : "内伤",
    "lvl"   : 140,
    "skill_name" : "白骨无限寒" ,
]),
});

int valid_enable(string usage) { return usage=="strike" ||  usage=="parry"; }  

int valid_combine(string combo) { return combo=="shenlong-bashi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练化骨绵掌必须空手。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功心法火候不够，练化骨绵掌会走火入魔。\n");

        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力太弱，无法练化骨绵掌。\n");

	if ((int)me->query_skill("strike", 1) < (int)me->query_skill("huagu-mianzhang", 1))
		return notify_fail("你的基本掌法火候有限，无法领会更高深的化骨绵掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i - 1]["lvl"])
                        return action[i - 1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("huagu-mianzhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练化骨绵掌。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -47);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"huagu-mianzhang/" + action;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
	int lvl;
        int flvl;

	lvl  = me->query_skill("huagu-mianzhang", 1);
        flvl = me->query("jiali");
	if (lvl < 80 || flvl < 10 || ! damage_bonus)
		return;

    	if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("huagu",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 50 + random(lvl / 20) ])))
        {
                return "“喀喇”一声响，$n大声惨叫，连退数步。\n";
    	}
}
