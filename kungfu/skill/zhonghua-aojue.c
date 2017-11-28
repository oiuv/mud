inherit FORCE;

string *dodge_msg = ({
        "$n暗运内力，$N的进攻就如击到气墙上，没有半点效果。\n",
        "$n大喝一声，一股气流直冲而出，硬生生震退了$N。\n",
        "$n身子一转，一股旋风将$N的招数全部化解。\n",
        "$n哼然冷笑，微微移动，内力回旋使$N的进攻差之毫厘。\n",
});

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("zhonghua-aojue", 1);
        return lvl * lvl * 15 * 22 / 100 / 200;
}


mapping *actionf = ({
([      "action":"$N跨出一步，一指缓缓戳向$n的$l，笼罩了方圆数寸的范围",
        "force" : 500,
        "attack": 150,
        "dodge" : 90,
        "parry" : 88,
        "damage": 170,
        "damage_type":  "刺伤"
]),
([      "action":"$N一声震喝，随即一掌劈出，中途却忽然一指刺向$n的$l",
        "force" : 510,
        "attack": 165,
        "dodge" : 110,
        "parry" : 90,
        "damage": 160,
        "damage_type":  "刺伤"
]),
([      "action":"$N疾走数步，左掌掌劈向$n的肩头，右手食却点向$n的$l，",
        "force" : 515,
        "attack": 155,
        "dodge" : 85,
        "parry" : 85,
        "damage": 175,
        "damage_type":  "刺伤"
]),
([      "action":"$N深吸一口气，步步进逼，双掌连环劈向$n的$l",
        "force" : 520,
        "attack": 140,
        "dodge" : 80,
        "parry" : 90,
        "damage": 180,
        "damage_type":  "瘀伤"
]),
([      "action":"$N身体原地不动，双掌平推，一股掌力凌空奔$n而去",
        "force" : 535,
        "attack": 135,
        "dodge" : 80,
        "parry" : 95,
        "damage": 170,
        "damage_type":  "内伤"
]),
([      "action":"$N足下暗和八卦，步法变幻莫测，左右掌连翻出击，攻向$n",
        "force" : 500,
        "attack": 150,
        "dodge" : 85,
        "parry" : 115,
        "damage": 165,
        "damage_type":  "震伤"
]),
});

mapping *actionw = ({
([      "action":"$N跨出一步，手中$w缓缓刺向$n，笼罩了方圆数寸的范围",
        "force" : 450,
        "attack": 170,
        "dodge" : 100,
        "parry" : 110,
        "damage": 240,
        "damage_type":  "刺伤"
]),
([      "action":"$N一声震喝，手中的$w随即横扫$n，中途却忽然刺向$n的$l",
        "force" : 460,
        "attack": 165,
        "dodge" : 80,
        "parry" : 110,
        "damage": 250,
        "damage_type":  "刺伤"
]),
([      "action":"$N疾走数步，左掌掌劈向$n的肩头，右手的$w却点向$n的$l，",
        "force" : 480,
        "attack": 175,
        "dodge" : 85,
        "parry" : 100,
        "damage": 260,
        "damage_type":  "刺伤"
]),
([      "action":"$N深吸一口气，步步进逼，手中的$w连环刺向$n的$l",
        "force" : 475,
        "attack": 180,
        "dodge" : 75,
        "parry" : 120,
        "damage": 275,
        "damage_type":  "刺伤"
]),
([      "action":"$N身体原地不动，手中的$w一划，一股内力凌空奔$n而去",
        "force" : 480,
        "attack": 175,
        "dodge" : 80,
        "parry" : 125,
        "damage": 280,
        "damage_type":  "刺伤"
]),
([      "action":"$N足下暗合八卦，步法变幻莫测，手中的$w化作数道光芒，攻向$n",
        "force" : 490,
        "dodge" : 160,
        "parry" : 110,
        "damage": 320,
        "damage_type":  "刺伤"
]),
});

string *usage_skills = ({ "unarmed", "strike", "sword", "dodge",
                          "parry", "force" });

int valid_enable(string usage)
{
        return (member_array(usage, usage_skills) != -1);
}

int valid_force(string force) { return 1; }

int valid_combo(string combo)
{
        return combo == "zhonghua-aojue" ;
}

int double_attack() { return 1; }

mapping query_action(object me, object weapon)
{
        return weapon ? actionw[random(sizeof(actionw))] :
                        actionf[random(sizeof(actionw))];
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int valid_learn(object me)
{
        int level;
        int i;

        if (me->query("character") != "光明磊落")
                return notify_fail("中华傲决正大恢弘，气度俨然，你"
                                   "怎么也学不得神似。\n");

        if ((int)me->query("combat_exp") < 3000000)
                return notify_fail("你觉得中华傲决深奥之极，"
                                   "凭自己的战斗经验一时间难以领会。\n");

        if ((int)me->query_skill("martial-cognize", 1) < 300)
                return notify_fail("你觉得中华傲决过于深奥之极，以"
                                   "自己的武学修养全然无法明白。\n");

        if (me->query("int") < 35)
                return notify_fail("你觉得中华傲决过于艰深，难以理解。\n");

        if (me->query("con") < 31)
                return notify_fail("依照你的根骨无法修炼中华傲决。\n");

        if (me->query("gender") == "无性" &&
            (int)me->query_skill("zhonghua-aojue", 1) > 219)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的中华傲决。\n");

        level = me->query_skill("zhonghua-aojue", 1);

        if ((int)me->query_skill("martial-cognize", 1) < level)
                return notify_fail("你觉得自己的武学修养有限，难以领会更高深的中华傲决。\n");

        for (i = 0; i < sizeof(usage_skills); i++)
                if (me->query_skill(usage_skills[i], 1) < level)
                        return notify_fail("你对" + to_chinese(usage_skills[i]) +
                                           "的理解还不够，无法继续领会更高深的中华傲决。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("中华傲决博大精深，无法简单的通过练习进步。\n");
}

int difficult_level()
{
        return 500;
}

string perform_action_file(string action)
{
        return __DIR__"zhonghua-aojue/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"zhonghua-aojue/exert/" + action;
}

