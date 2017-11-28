inherit SKILL;

mapping *action = ({
([      "action": "$N单手上抬，一招查拳的［冲天炮］，对准$n的$l猛击下去",
        "force" : 120,
        "attack": 30,
        "dodge" : 5,
        "parry" : 5,
        "damage": 40,
        "lvl"   : 0,
        "skill_name" : "查拳",
        "damage_type":  "砸伤"
]),
([      "action": "$N一招燕青拳的［白鹤亮翅］，身子已向左转成弓箭步，两臂向后成钩手，呼\n"
                  "的一声轻响，反击$n$l",
        "force" : 180,
        "attack": 35,
        "dodge" : 10,
        "parry" : 50,
        "damage": 55,
        "lvl"   : 0,
        "skill_name" : "燕青拳",
        "damage_type":  "瘀伤"
]),
([      "action": "$N往后一纵，施展小擒拿手的手法，双手对着$n$l处的关节直直抓去",
        "force" : 220,
        "attack": 40,
        "dodge" : 15,
        "parry" : 15,
        "damage": 70,
        "lvl"   : 0,
        "skill_name" : "小擒拿手",
        "damage_type":  "抓伤"
]),
([      "action": "$N左拳拉开，右拳转臂回扰，一招少林的大金刚拳突然击出，带着许许风声贯向$n",
        "force" : 280,
        "attack": 60,
        "dodge" : 22,
        "parry" : 20,
        "damage": 90,
        "lvl"   : 30,
        "skill_name" : "少林大金刚拳",
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N运足气力，使出八极拳中的［八极翻手式］，双掌对着$n的$l平平攻去",
        "force" : 340,
        "attack": 55,
        "dodge" : 40,
        "parry" : 40,
        "damage": 80,
        "lvl"   : 60,
        "skill_name" : "八极拳",
        "damage_type":  "瘀伤"
]),
([      "action": "$N大喝一声，左手往$n身后一抄，右掌往$n反手击去，正是八卦掌的招式",
        "force" : 360,
        "attack": 65,
        "dodge" : 30,
        "parry" : 30,
        "damage": 95,
        "lvl"   : 80,
        "skill_name" : "八卦掌",
        "damage_type":  "瘀伤"
]),
([      "action": "$N提气游走，左手护胸，右手一招游身八卦掌的［游空探爪］，迅速拍向$n$l",
        "force" : 420,
        "attack": 80,
        "dodge" : 45,
        "parry" : 45,
        "damage": 85,
        "lvl"   : 100,
        "skill_name" : "游身八卦掌",
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N拉开架式，把武当派的绵掌使得密不透风，招招不离$n的$l",
        "force" : 380,
        "attack": 75,
        "dodge" : 90,
        "parry" : 90,
        "damage": 70,
        "lvl"   : 120,
        "skill_name" : "武当绵掌",
        "damage_type":  "瘀伤"
]),
([      "action": "$N突然飞身一跃而起，双手握做爪状，朝着$n的$l猛然抓去，凛然是鹰爪功的招式",
        "force" : 440,
        "attack": 105,
        "dodge" : 90,
        "parry" : 70,
        "damage": 105,
        "lvl"   : 140,
        "skill_name" : "鹰爪功",
        "damage_type":  "抓伤"
]),
([      "action": "只见$N身形一矮，双手翻滚，一招太极拳［云手］直拿$n$l",
        "force" : 450,
        "attack": 90,
        "dodge" : 90,
        "parry" : 100,
        "damage": 90,
        "lvl"   : 160,
        "skill_name" : "太极拳",
        "damage_type":  "瘀伤"
]),
([      "action": "$N一个转身，趁$n不备，反手将$n牢牢抱住猛的朝地面摔去，竟然是蒙古的摔角招式",
        "force" : 460,
        "attack": 105,
        "dodge" : 5,
        "parry" : 60,
        "damage": 105,
        "lvl"   : 180,
        "skill_name" : "摔角",
        "damage_type":  "摔伤"
]),
});

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练百花错拳必须空手。\n");

        if (me->query("max_neili") < 1500)
                return notify_fail("你的内力修为远远不足，难以练习百花错拳。\n");

        if ((int)me->query_skill("force", 1) < 150)
                return notify_fail("你的内功火候尚浅，无法学习百花错拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 200)
                return notify_fail("你的拳脚根基有限，无法体会百花错拳要诣。\n");

        if ((int)me->query_skill("cuff", 1) < 150)
                return notify_fail("你的拳法根基有限，无法体会百花错拳要诣。\n");

        if ((int)me->query_skill("hand", 1) < 150)
                return notify_fail("你的手法根基有限，无法体会百花错拳要诣。\n");

        if ((int)me->query_skill("claw", 1) < 150)
                return notify_fail("你的爪法根基有限，无法体会百花错拳要诣。\n");

        if ((int)me->query_skill("strike") < 150)
                return notify_fail("你的掌法根基有限，无法体会百花错拳要诣。\n");

        if ((int)me->query_skill("unarmed", 1)/3 < (int)me->query_skill("baihua-quan", 1)/2)
                return notify_fail("你的拳脚根基火候不足，无法领会更高深的百花错拳。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("baihua-quan", 1))
                return notify_fail("你的拳法根基火候不足，无法领会更高深的百花错拳。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("baihua-quan", 1))
                return notify_fail("你的手法根基火候不足，无法领会更高深的百花错拳。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("baihua-quan", 1))
                return notify_fail("你的爪法根基火候不足，无法领会更高深的百花错拳。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("baihua-quan", 1))
                return notify_fail("你的掌法根基火候不足，无法领会更高深的百花错拳。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "cuff" || usage == "unarmed" || usage == "parry" || usage == "hand" || usage == "strike" || usage == "claw";
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
        level = (int)me->query_skill("baihua-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -100);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"baihua-quan/" + action;
}

