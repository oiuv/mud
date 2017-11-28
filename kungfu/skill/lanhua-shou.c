#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N右手五指分开，微微一拂，一式「花疏云淡」拂向$n的膻中要穴",
        "force" : 100,
        "dodge" : 15,
        "damage": 15,
        "lvl"   : 0,
        "damage_type" : "瘀伤",
        "skill_name" : "花疏云淡"
]),
([      "action": "$N侧身掠向$n，一式「轻云蔽月」，左手五指拨向$n的胸前大穴",
        "force" : 130,
        "dodge" : 20,
        "damage": 30,
        "lvl"   : 30,
        "damage_type" : "瘀伤",
        "skill_name" : "轻云蔽月"
]),
([      "action": "$N使一式「云破月来」，左掌虚攻，并指斜前翻出，拍向$n的肩井穴",
        "force" : 170,
        "dodge" : 25,
        "damage": 40,
        "lvl"   : 60,
        "damage_type" : "内伤",
        "skill_name" : "云破月来"
]),
([      "action": "$N微微侧身，右掌勾上，一式「幽兰弄影」，缓缓拂向$n的天突穴",
        "force" : 190,
        "dodge" : 25,
        "damage": 45,
        "lvl"   : 80,
        "damage_type" : "瘀伤",
        "skill_name" : "幽兰弄影"
]),
([      "action": "$N使一式「芳兰竟体」，身影不定地掠至$n身后，猛地拍向$n的大椎穴",
        "force" : 220,
        "dodge" : 30,
        "damage": 50,
        "lvl"   : 100,
        "damage_type" : "瘀伤",
        "skill_name" : "芳兰竟体"
]),
([      "action": "$N施出「兰桂齐芳」，双手向外一拨，逼向$n的华盖、璇玑、紫宫几处大穴",
        "force" : 250,
        "dodge" : 35,
        "damage": 55,
        "lvl"   : 120,
        "damage_type" : "瘀伤",
        "skill_name" : "兰桂齐芳"
]),
([      "action": "$N一式「月影花香」，居高临下，拂出一道劲力罩向$n的百会大穴",
        "force" : 280,
        "dodge" : 40,
        "damage": 65,
        "lvl"   : 140,
        "damage_type" : "内伤",
        "skill_name" : "月影花香"
]),
([      "action": "$N施展出「花好月圆」，双手疾拂，一环环的劲气逼向$n的上中下各大要穴",
        "force" : 320,
        "dodge" : 45,
        "damage": 70,
        "lvl"   : 160,
        "damage_type" : "内伤",
        "skill_name" : "花好月圆"
])
});

int valid_enable(string usage)
{
	return usage == "hand" ||  usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "luoying-shenzhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练兰花拂穴手必须空手。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法学兰花拂穴手。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力太弱，无法练兰花拂穴手。\n");

        if ((int)me->query_skill("hand", 1) < 100)
                return notify_fail("你的基本手法太差，无法学习兰花拂穴手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("lanhua-shou", 1))
                return notify_fail("你的基本手法火候不够，无法领会更高深的兰花拂穴手。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("lanhua-shou", 1);

        if (level > 100
           && random(10) == 1
           && me->query_skill("jingluo-xue", 1) > 100
           && me->query("neili") > 1000)
        {
                me->add("neili", -300);
                return ([       "action" : HIW "$N" HIW "两臂交叉置于胸前，指形作兰花状陡然翻上，疾点$n"
                                           HIW "胸前诸多要穴",
                                "attack" : 100,
                                "dodge"  : 300,
                                "parry"  : 300,
                                "damage" : 100,
                                "force"  : 200,
                                "weapon" : "兰花指",
                                "damage_type": "点穴"
                        ]);
        }

        for (i = sizeof(action); i > 0; i--)
                if(level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了，无法练兰花拂穴手。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的体力太低了，无法练兰花拂穴手。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -53);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"lanhua-shou/" + action;
}
