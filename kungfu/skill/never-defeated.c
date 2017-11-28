// never-defeated.c 不败神功

inherit FORCE;

string *dodge_msg = ({
        "$n移开数步，恰好躲过了$N的攻击。\n",
        "$n忽然反击，直指$N的破绽，逼得$N只能回守。\n",
        "$n轻身闪避，将$N的实招全部躲过。\n",
        "$n脚下一个跄踉，似乎无意，却刚好躲过$N这一击。\n",
});

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("never-defeated", 1);
        return lvl * lvl * 20 * 15 / 100 / 200;
}

mapping *action_default = ({
([      "action" : "$N攻势忽缓而不疏，似剑法又似刀法，捉摸不定向$n慢慢推去",
        "force" : 410,
        "attack": 150,
        "dodge" : 70,
        "parry" : 120,
        "damage": 225,
        "damage_type":  "震伤"
]),
([      "action":"$N手中的$w突焕气象森严，便似千军万马奔驰而来，横扫$n",
        "force" : 410,
        "attack": 160,
        "dodge" : 85,
        "parry" : 110,
        "damage": 210,
        "damage_type":  "擦伤"
]),
([      "action":"$N举起手中的$w，对着$n乱砍乱砸，没有半点章法",
        "force" : 430,
        "attack": 170,
        "dodge" : 70,
        "parry" : 130,
        "damage": 205,
        "damage_type":  "割伤"
]),
([      "action":"$N运用$w幻化做一个一个圆圈，似乎要将$n包围",
        "force" : 425,
        "attack": 160,
        "dodge" : 65,
        "parry" : 125,
        "damage": 190,
        "damage_type":  "内伤"
]),
([      "action":"$N含笑回转$w，伸手一指，颇得拈花指之意，点向$n的$l",
        "force" : 530,
        "attack": 176,
        "dodge" : 75,
        "parry" : 115,
        "damage": 200,
        "damage_type":  "刺伤"
]),
([      "action":"$N长叹一声，将$w随手递出，连自己也不知道也攻向哪里",
        "force" : 440,
        "attack": 170,
        "dodge" : 80,
        "parry" : 125,
        "damage": 210,
        "damage_type":  "割伤"
]),
([      "action":"$N神色凝重，$w上劈下切左右横扫，挟雷霆万钧之势逼往$n",
        "force" : 410,
        "attack": 160,
        "dodge" : 95,
        "parry" : 120,
        "damage": 220,
        "damage_type":  "内伤"
]),
([      "action":"$N运起$w，就如狂风暴雨，霍霍亮光中反攻$n的$l，尝试逼$n自守",
        "force" : 420,
        "attack": 150,
        "dodge" : 95,
        "parry" : 135,
        "damage": 200,
        "damage_type":  "内伤"
]),
([      "action":"$N突然如痴如狂，手中的$w猛然向$n周身乱刺乱削",
        "force" : 410,
        "attack": 165,
        "dodge" : 85,
        "parry" : 125,
        "damage": 235,
        "damage_type":  "割伤"
]),
([      "action":"$N将$w随手一摆，$n反而自己向$w撞将上来，神兵之威，实人所难测",
        "force" : 430,
        "attack": 180,
        "dodge" : 75,
        "parry" : 110,
        "damage": 225,
        "damage_type":  "瘀伤"
]),
([      "action":"$N手中的$w忽起剑势，却似或刀法，又夹杂棍杖之意，令$n眩目",
        "force" : 420,
        "attack": 175,
        "dodge" : 85,
        "parry" : 130,
        "damage": 220,
        "damage_type":  "刺伤"
]),
});

mapping *action_whip = ({
([      "action" : "$N攻势忽缓而不疏，$w变化无常，捉摸不定向$n慢慢卷去",
        "force" : 430,
        "attack": 180,
        "dodge" : 75,
        "parry" : 115,
        "damage": 225,
        "damage_type": "擦伤"
]),
([      "action":"$N手中的$w突焕气象森严，便似千军万马奔驰而来，$w就如棍棒一般横扫$n",
        "force" : 410,
        "attack": 160,
        "dodge" : 85,
        "parry" : 125,
        "damage": 210,
        "damage_type": "擦伤"
]),
([      "action":"$N卷起手中的$w，就如铁锤一般对着$n乱砍乱砸，没有半点章法",
        "force" : 440,
        "attack": 175,
        "dodge" : 80,
        "parry" : 125,
        "damage": 205,
        "damage_type": "割伤"
]),
([      "action":"$N运用$w幻化做一个一个圆圈，似乎要将$n团团包围",
        "force" : 425,
        "attack": 160,
        "dodge" : 65,
        "parry" : 125,
        "damage": 190,
        "damage_type": "内伤"
]),
([      "action":"$N含笑回转$w，伸手一指，颇得拈花指之意，点向$n的$l",
        "force" : 510,
        "attack": 180,
        "dodge" : 70,
        "parry" : 120,
        "damage": 200,
        "damage_type": "刺伤"
]),
});

string *usage_skills = ({ "sword", "blade", "dagger",
                          "staff", "hammer", "club", "whip",  
                          "dodge", "parry", "force", "throwing" });

int valid_enable(string usage)
{
        return (member_array(usage, usage_skills) != -1);
}

int valid_combo(string combo)
{
        return combo == "never-defeated";
}

int valid_force(string force) { return 1; }

int double_attack() { return 1; }

mapping query_action(object me, object weapon)
{
        switch (weapon ? weapon->query("skill_type") : "default")
        {
        case "whip":
                return action_whip[random(sizeof(action_whip))];
        default:
                return action_default[random(sizeof(action_default))];
        }
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int valid_learn(object me)
{
        int level;
        //int i;

        if ((int)me->query("combat_exp") < 3000000)
                return notify_fail("你觉得不败神功深奥之极，"
                                   "凭自己的战斗经验一时间难以领会。\n");

        if ((int)me->query_skill("martial-cognize", 1) < 50)
                return notify_fail("你觉得不败神功过于深奥，以"
                                   "自己的武学修养全然无法明白。\n");

        if (me->query("character") != "狡黠多变")
                return notify_fail("你学了半天，发现不败神功古怪的"
                                   "紧，不合常理，根本无法领会。");

        if (me->query("int") < 22)
                return notify_fail("你觉得不败神功过于深奥，绝"
                                   "非自己的智力所能理解。\n");

	if (me->query("gender") == "无性" &&
	    (int)me->query_skill("never-defeated", 1) > 239)
		return notify_fail("你无根无性，阴阳不调，难以领会高深的不败神功。\n");

        level = me->query_skill("never-defeated", 1);

        if ((int)me->query_skill("martial-cognize", 1) < level)
                return notify_fail("你觉得自己的武学修养有限，难以领会更高深的不败神功。\n");

        if (me->query_skill("force", 1) < level)
                return notify_fail("你对基本内功的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        if (me->query_skill("parry", 1) < level)
                return notify_fail("你对基本招架的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        if (me->query_skill("dodge", 1) < level)
                return notify_fail("你对基本轻功的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        if (me->query_skill("sword", 1) < level)
                return notify_fail("你对基本剑法的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        if (me->query_skill("blade", 1) < level)
                return notify_fail("你对基本刀法的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        if (me->query_skill("whip", 1) < level)
                return notify_fail("你对基本鞭法的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        if (me->query_skill("throwing", 1) < level)
                return notify_fail("你对基本暗器的理解还不够，无法继续"
                                   "领会更高深的不败神功。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("不败神功博大精深，无法简单的通过练习进步。\n");
}

int difficult_level()
{
        return 500;
}

string perform_action_file(string action)
{
        return __DIR__"never-defeated/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"never-defeated/exert/" + action;
}


