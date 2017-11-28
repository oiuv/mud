inherit SKILL;

mapping *action = ({
([      "action": "只见$N身形一矮，大喝声中一个「冲天炮」对准$n鼻子呼地砸了去",
        "dodge": 5,
        "parry": 5,
        "force": 90,
        "skill_name" : "冲天炮",
        "damage_type":  "砸伤"
]),
([      "action": "$N左手一分，右拳运气，一招「拔草寻蛇」便往$n的$l招呼过去",
        "dodge": 5,
        "parry": 5,
        "force": 60,
        "skill_name" : "拔草寻蛇",
        "damage_type":  "瘀伤"
]),
([      "action": "$N右拳在$n面门一晃，左掌使了个「叶底偷桃」往$n的$l狠命一抓",
        "dodge": 5,
        "parry": 5,
        "force": 60,
        "skill_name" : "叶底偷桃",
        "damage_type":  "抓伤"
]),
([      "action": "$N步履一沉，左拳拉开，右拳带风，一招「黑虎掏心」击向$n的$l",
        "dodge": 5,
        "parry": 5,
        "force": 80,
        "skill_name" : "黑虎掏心",
        "damage_type":  "瘀伤"
]),
([      "action": "$N拉开架式，一招「双风贯耳」使得虎虎有风。底下却一脚踢向$n",
        "dodge": 5,
        "parry": 5,
        "force": 70,
        "skill_name" : "双风贯耳",
        "damage_type":  "瘀伤"
]),
([      "action": "$N拉开后弓步，双掌使了个「如封似闭」往$n的$l一推",
        "dodge": 5,
        "parry": 5,
        "force": 50,
        "skill_name" : "如封似闭",
        "damage_type":  "瘀伤"
]),
([      "action": "$N往后一纵，就势使了个「老树盘根」，右腿扫向$n的$l",
        "dodge": 5,
        "parry": 5,
        "force": 50,
        "skill_name" : "老树盘根",
        "damage_type":  "砸伤"
]),
([      "action": "$N转身左掌护胸，右掌反手使了个「独劈华山」往$n当头一劈",
        "dodge": 5,
        "parry": 5,
        "force": 90,
        "skill_name" : "独劈华山",
        "damage_type":  "砸伤"
]),
});

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        int lv = me->query_skill("changquan", 1);

        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练太祖长拳必须空手。\n");

        if (me->query_skill("unarmed", 1) < lv
           && me->query_skill("cuff", 1) < lv)
                return notify_fail("你拳脚与拳法均火候不足，无法领会更高"
                                   "深的太祖长拳。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "cuff" || usage == "unarmed" || usage == "parry";
}

string query_skill_name(int lvl)
{
        return action[random(sizeof(action))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -50);
        return 1;
}
