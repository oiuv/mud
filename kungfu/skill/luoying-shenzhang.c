inherit SKILL;

mapping *action = ({
([      "action" : "$N双手平伸，向外掠出，一式「春云乍展」，指尖轻轻反点$n的$l",
        "force"  : 68,
        "attack" : 12,
        "dodge"  : 4,
        "parry"  : 5,
        "damage" : 2,
        "lvl"    : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "春云乍展"
]),
([      "action" : "$N右手五指缓缓一收，一式「回风拂柳」，五指忽然拂向$n五处大穴",
        "force"  : 80,
        "attack" : 14,
        "dodge"  : 7,
        "parry"  : 8,
        "damage" : 5,
        "lvl"    : 20,
        "damage_type" : "内伤",
        "skill_name"  : "回风拂柳"
]),
([      "action" : "$N陡然一个轻巧转身，单掌劈落，一式「江城飞花」，拍向$n的头顶",
        "force"  : 91,
        "attack" : 17,
        "dodge"  : 10,
        "parry"  : 13,
        "damage" : 9,
        "lvl"    : 40,
        "damage_type" : "瘀伤",
        "skill_name"  : "江城飞花"
]),
([      "action" : "$N突然跃起，双手连环，运掌如剑，一式「雨急风狂」，攻向$n的全身",
        "force"  : 108,
        "attack" : 22,
        "dodge"  : 17,
        "parry"  : 15,
        "damage" : 12,
        "lvl"    : 60,
        "damage_type" : "瘀伤",
        "skill_name"  : "雨急风狂"
]),
([      "action" : "$N伸出右手并拢食指中指，捻个剑决，一式「星河在天」，直指$n中盘",
        "force"  : 138,
        "attack" : 29,
        "dodge"  : 20,
        "parry"  : 25,
        "damage" : 23,
        "lvl"    : 80,
        "damage_type" : "瘀伤",
        "skill_name"  : "星河在天"
]),
([      "action" : "$N突然抽身而退，一式「流华纷飞」，平身飞起，双掌向$n连拍数掌",
        "force"  : 180,
        "attack" : 33,
        "dodge"  : 13,
        "parry"  : 16,
        "damage" : 28,
        "lvl"    : 100,
        "damage_type" : "瘀伤",
        "skill_name"  : "流华纷飞"
]),
([      "action" : "$N突然抽身跃起，右掌翻滚，一式「彩云追月」抢在左掌前向$n的$l拍去",
        "force"  : 210,
        "attack" : 38,
        "dodge"  : 30,
        "parry"  : 25,
        "damage" : 33,
        "lvl"    : 120,
        "damage_type" : "瘀伤",
        "skill_name"  : "彩云追月"
]),
([      "action" : "$N使一式「天如穹庐」，全身飞速旋转，双掌忽前忽后猛地拍向$n的胸口",
        "force"  : 260,
        "attack" : 44,
        "dodge"  : 34,
        "parry"  : 26,
        "damage" : 41,
        "lvl"    : 140,
        "damage_type" : "瘀伤",
        "skill_name"  : "天如穹庐"
]),
([      "action" : "$N前后一揉，一式「朝云横度」，化掌如剑，一股凌厉剑气袭向$n下盘",
        "force"  : 290,
        "attack" : 52,
        "dodge"  : 43,
        "parry"  : 45,
        "damage" : 51,
        "lvl"    : 160,
        "damage_type" : "内伤",
        "skill_name"  : "朝云横度"
]),
([      "action" : "$N使一式「白虹经天」，双掌舞出无数圈劲气，一环环向$n的$l斫去",
        "force"  : 310,
        "attack" : 72,
        "dodge"  : 41,
        "parry"  : 55,
        "damage" : 68,
        "lvl"    : 180,
        "damage_type" : "内伤",
        "skill_name"  : "白虹经天"
]),
([      "action" : "$N双手食指和中指一和，一式「紫气东来」，一股强烈的气流涌向$n全身",
        "force"  : 330,
        "attack" : 79,
        "dodge"  : 36,
        "parry"  : 61,
        "damage" : 85,
        "lvl"    : 200,
        "damage_type" : "内伤",
        "skill_name"  : "紫气东来"
]),
([      "action" : "$N一式「落英漫天」，双掌在身前疾转，掌花飞舞，铺天盖地直指向$n",
        "force"  : 378,
        "attack" : 84,
        "dodge"  : 41,
        "parry"  : 65,
        "damage" : 103,
        "lvl"    : 220,
        "damage_type" : "瘀伤",
        "skill_name"  : "落英漫天"
])
});

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "lanhua-shou";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练落英神剑掌必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法学落英神剑掌。\n");

        if ((int)me->query("max_neili") < 400)
                return notify_fail("你的内力太弱，无法练落英神剑掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("luoying-shenzhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的落英神剑掌。\n");

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
        level = (int)me->query_skill("luoying-shenzhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练落英神剑掌。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -40);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"luoying-shenzhang/" + action;
}
