// shennong-zhang.c 神农杖法
// Edit By Vin Oo 22/2/2001

inherit SKILL;

mapping *action = ({
([      "action": "$N微一躬身，一招「混沌初开」，$w带着刺耳的吱吱声，擦地扫向$n的脚踝",
        "force" : 130,
        "attack": 10,
        "dodge" : -5,
        "parry" : 19,
        "damage": 20,
        "lvl"   : 0,
        "skill_name" : "混沌初开",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「后羿射日」，右手托住杖端，左掌居中一击，令其凭惯性倒向$n的肩头",
        "force" : 140,
        "attack": 15,
        "dodge" : -10,
        "parry" : 15,
        "damage": 25,
        "lvl"   : 20,
        "skill_name" : "后羿射日",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「夸父赶日」，飞身一跃而起，$w挥舞转动不停，逼得$n左闪右避，狼狈不堪",
        "force" : 150,
        "attack": 20,
        "dodge" : -5,
        "parry" : 19,
        "damage": 30,
        "lvl"   : 40,
        "skill_name" : "夸父赶日",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「莫邪奠剑」，手中$w斜指苍天，呆呆地盯了一会，突然猛地一杖刺向$n的$l",
        "force" : 160,
        "attack": 25,
        "dodge" : -5,
        "parry" : 22,
        "damage": 40,
        "lvl"   : 60,
        "skill_name" : "莫邪奠剑",
        "damage_type":"挫伤"
]),
([      "action": "$N高举$w，猛然一声暴喝，杖端遥指$n，一招「大禹治水」，携着呼啸声贯向$n",
        "force" : 180,
        "attack": 30,
        "dodge" : -15,
        "parry" : 28,
        "damage": 50,
        "lvl"   : 80,
        "skill_name" : "大禹治水",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「伏羲披靡」，身形一展，持杖狂挥，$w全力一击拦腰向$n劈去",
        "force" : 210,
        "attack": 35,
        "dodge" : 5,
        "parry" : 32,
        "damage": 57,
        "lvl"   : 100,
        "skill_name" : "伏羲披靡",
        "damage_type":"挫伤"
]),
([      "action": "$N面色庄严，一招「轩辕帝威」，端持$w，陡然间身形一晃，疾风般一杖凌空攻向$n而去",
        "force" : 240,
        "attack": 40,
        "dodge" : -5,
        "parry" : 37,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "轩辕帝威",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「化蛇易龙」，单手持杖，力注于腕，待$n攻来， $w猛地弹射而起，击向$n",
        "force" : 260,
        "attack": 45,
        "dodge" : -5,
        "parry" : 45,
        "damage": 71,
        "lvl"   : 140,
        "skill_name" : "化蛇易龙",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「女娲补天」，猛然一个翻滚拔地而起，高举$w凌空打向$n的头部",
        "force" : 280,
        "attack": 50,
        "dodge" : -5,
        "parry" : 55,
        "damage": 70,
        "lvl"   : 160,
        "skill_name" : "女娲补天",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「蚩尤戮血」，身不动，脚不移，$w却晃动不定，不偏不倚地倒插向$n的要穴",
        "force" : 310,
        "attack": 55,
        "dodge" : -5,
        "parry" : 58,
        "damage": 84,
        "lvl"   : 180,
        "skill_name" : "蚩尤戮血",
        "damage_type":"挫伤"
]),
([      "action": "$N高举$w，一招「盘古开天」，身形如鬼魅般飘出，对准$n的天灵盖一杖打下",
        "force" : 330,
        "attack": 61,
        "dodge" : -5,
        "parry" : 62,
        "damage": 90,
        "lvl"   : 200,
        "skill_name" : "盘古开天",
        "damage_type":"挫伤"
]),
([      "action": "$N一招「神农百草」，单腿独立，$w舞成千百根相似，根根砸向$n全身各处要害",
        "force" : 350,
        "attack": 65,
        "dodge" : -5,
        "parry" : 67,
        "damage": 95,
        "lvl"   : 220,
        "skill_name" : "神农百草",
        "damage_type":"挫伤"
]),
});

int valid_enable(string usage) { return usage == "staff" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query_skill("force") < 130)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("staff") < 50)
                return notify_fail("你的基本杖法水平不足。\n");

        if ((int)me->query_skill("staff", 1) < (int)(int)me->query_skill("shennong-zhang", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的神农杖法。\n");

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
        level = (int) me->query_skill("shennong-zhang",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练神农杖法。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练神农杖法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -85);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shennong-zhang/" + action;
}
