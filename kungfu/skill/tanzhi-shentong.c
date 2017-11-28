#include <ansi.h>
inherit SKILL;

string *xue_name = ({ 
"劳宫穴", "膻中穴", "曲池穴", "关元穴", "曲骨穴", "中极穴", "承浆穴", "天突穴", "百会穴",
"幽门穴", "章门穴", "大横穴", "紫宫穴", "冷渊穴", "天井穴", "极泉穴", "清灵穴", "至阳穴", });

mapping *action_finger = ({
([      "action" : "$N右指划了个半圈，一式「划天裂地」自上而下划向$n的全身",
        "force" : 440,
        "attack": 100,
        "parry" : 50,
        "dodge" : 75,
        "damage": 131,
        "skill_name" : "划天裂地",
        "damage_type" : "刺伤"
]),
([      "action" : "$N左掌护胸，一招「我心悠悠」，右指欲举无力指向$n的额头",
        "force" : 410,
        "attack": 90,
        "parry" : 65,
        "dodge" : 90,
        "damage": 103,
        "skill_name" : "我心悠悠",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双手齐出，一式「千夫所指」，顿时一道劲疾射$n的$l处",
        "force" : 420,
        "attack": 110,
        "parry" : 65,
        "dodge" : 85,
        "damage": 121,
        "skill_name" : "千夫所指",
        "damage_type" : "刺伤"
]),
([      "action" : "$N仰天一叹，一招「弹指人生」，双手幻出重重指影，点向$n的$l",
        "force" : 400,
        "attack": 100,
        "parry" : 70,
        "dodge" : 95,
        "damage": 98,
        "skill_name" : "弹指人生",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一式「笑指天南」，左掌蓄式，右指弹出一缕指风点向$n的$l",
        "force" : 430,
        "attack": 95,
        "parry" : 45,
        "dodge" : 100,
        "damage": 105,
        "skill_name" : "笑指天南",
        "damage_type" : "刺伤"
]),
([      "action" : "$N施展出一招「擎天一指」，蓄集全身力气，一指点向$n的$l",
        "force" : 450,
        "attack": 105,
        "parry" : 65,
        "dodge" : 90,
        "damage": 130,
        "skill_name" : "擎天一指",
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage)
{
        return usage == "finger" ||
               usage == "parry" ||
               usage == "throwing";
}

int valid_learn(object me)
{
        if ((int)me->query("dex") < 34)
                return notify_fail("你的先天身法不足，无法修炼弹指神通。\n");

        if ((int)me->query_skill("force", 1) < 150)
                return notify_fail("你的内功火候不够，无法修炼弹指神通。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为太弱，无法修炼弹指神通。\n");

        if ((int)me->query_skill("finger", 1) < 150)
                return notify_fail("你的基本指法火候不够，无法学弹指神通。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("tanzhi-shentong", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的弹指神通。\n");

        return 1;
}

string query_skill_name(int level)
{
        return action_finger[random(sizeof(action_finger))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        return action_finger[random(sizeof(action_finger))];
}

//为弹指神通新增特防效果 2017-02-21
mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;

        if ((int)me->query_skill("tanzhi-shentong", 1) < 150
           || ! living(me)
           || me->is_busy()
           || me->query_skill_mapped("finger") != "tanzhi-shentong"
           || me->query_skill_mapped("throwing") != "tanzhi-shentong"
           || me->query_temp("weapon"))
            return;

        ap = ob->query_skill("force");
        dp = me->query_skill("parry", 1) / 2 +
             me->query_skill("tanzhi-shentong", 1);

        if (ap / 2 + random(ap) < dp)
        {
                
             
                        result = ([ "damage": -damage ]);

                        result += (["msg" : HIG "$n" HIG "不理会$N" HIG "的攻势，"
                                    "随意弹出一指，指劲正指向$N" HIG "招式中的破绽。\n" NOR]);
            
                        if (! ob->is_busy())
                        ob->start_busy(1);
             
             return result;
        }
}
//新增特防效果结束

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够，休息一下再练吧。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练弹指神通。\n");

        me->receive_damage("qi", 68);
        me->add("neili", -67);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        string name/*, weapon*/;
        name = xue_name[random(sizeof(xue_name))];

        if (damage_bonus < 150
           || me->query("neili") < 800
	   || me->query_skill("tanzhi-shentong", 1) < 100
	   || me->query_skill("jingluo-xue", 1) < 100
           || victim->is_busy())
                return 0;

        victim->start_busy(2);
        victim->receive_wound("qi", (damage_bonus - 100) / 4, me);

        if (victim->query("neili") <= (damage_bonus / 4 + 50))
                victim->set("neili", 0);
        else
                victim->add("neili", -damage_bonus / 4);

        return HIR "只听“飕”的一声，$n" HIR "被$N" HIR "凌空弹射出的指气点中" NOR +
               HIY + name + NOR + HIR "，全身登时一阵酸麻。\n" NOR;
}

string perform_action_file(string action)
{
        return __DIR__"tanzhi-shentong/" + action;
}