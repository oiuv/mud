// 五斗米神功 shenzhaojing.c
// Editd By Vin On 1/7/2001

#include <ansi.h>
inherit FORCE;

//增加五斗米神功的兼容性。
int valid_force(string force) { return 1; }

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("wudoumi-shengong", 1);
        return lvl * lvl * 15 * 10 / 100 / 200;
}

mapping *action = ({
([      "action" : "$N提运五斗米神功，呼的扑向$n，待至跟前，陡然一拳击向$n面门",
        "dodge"  : 31,
        "force"  : 323,
        "attack" : 89,
        "parry"  : 34,
        "damage" : 58,
        "lvl"    : 0,
        "damage_type": "内伤" 
]), 
([      "action" : "$N丝毫不动声色，右掌平伸，左掌运起五斗米神功的劲力，呼的一声拍向$n",
        "dodge"  : 43,
        "force"  : 362,
        "attack" : 103,
        "parry"  : 47,
        "damage" : 63,
        "lvl"    : 160,
        "damage_type": "内伤"
]), 
([      "action" : "$N身形微微一展，一双手掌便似渗出血一般，双掌齐施，猛拍$n前胸",
        "dodge"  : 48,
        "force"  : 413,
        "attack" : 122,
        "parry"  : 51,
        "damage" : 75,
        "lvl"    : 180,
        "damage_type": "内伤"
]),
([      "action" : "$N一声呼啸，双掌回收，凌空划出一个圆圈，顿时一股热浪直涌$n而出",
        "dodge"  : 41,
        "force"  : 451,
        "attack" : 113,
        "parry"  : 47,
        "damage" : 83,
        "lvl"    : 200,
        "damage_type": "内伤"
]), 
});

int valid_enable(string usage)
{ 
        object me = this_player();

        if (me->query("can_perform/wudoumi-shengong/gui"))
                return usage == "force" || usage=="unarmed" || usage =="parry";
        else
                return usage == "force";
       
}

int valid_learn(object me)
{
        //if (me->query("character") != "阴险奸诈")
        //修改天性，配合九阴九阳解反噬
        if (me->query("character") != "心狠手辣" && me->query("character") != "国士无双")
                return notify_fail("你暗想这五斗米神功损人不利己，修来何用？\n");

        if (me->query("con") < 24)
                return notify_fail("你按照法门运转了下内息，忽然只觉丹田一阵搅疼。\n");

/*
        因考虑五斗米神功的反噬情况，无玄门正宗的内功不能修炼高，所以暂
        时设为可以与辟邪剑法所共存的内功，如有不妥再作改正。

        if (me->query("gender") == "无性" && me->query("wudoumi-shengong", 1) > 29)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的五斗米神功。\n");
*/

        if ((int)me->query_skill("force", 1) < 50)
                return notify_fail("你的基本内功火候不足，不能学五斗米神功。\n");

        if ((int)me->query_skill("unarmed", 1) < 50)
                return notify_fail("你的基本拳脚火候不足，不能学五斗米神功。\n");

        if ((int)me->query("max_neili", 1) < 500)
                return notify_fail("你的内力修为不足，不能学五斗米神功。\n");

        if (me->query_skill("force", 1) < me->query_skill("wudoumi-shengong", 1))
                return notify_fail("你的基本内功水平不够，难以锻炼更深厚的五斗米神功。\n");

        if (me->query("can_perform/wudoumi-shengong/gui")
           && me->query_skill("unarmed", 1) < me->query_skill("wudoumi-shengong", 1))
                return notify_fail("你的基本拳脚水平不够，难以锻炼更深厚的五斗米神功。\n");

        return ::valid_learn(me);
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("wudoumi-shengong", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 50, level)];
}

int practice_skill(object me)
{
        return notify_fail("五斗米神功只能用学(learn)的来增加熟练度。\n");
}

void check_count(object me)
{
        if (me->query("max_neili") >= 3000 &&
            me->query("exception/wudoumi-count") > 1000)
        {
                me->apply_condition("wudoumi-fanshi",
                        me->query_condition("wudoumi-fanshi") +
                        me->query("exception/wudoumi-count") / 10);
                me->delete("exception/wudoumi-count");
        }
}

void skill_improved(object me)
{
        int level = (int)me->query_skill("wudoumi-shengong", 1);

        me->add("exception/wudoumi-count", level + 1);
        check_count(me);
}

int difficult_level()
{
        return 600;
}

string perform_action_file(string action)
{
        return __DIR__"wudoumi-shengong/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"wudoumi-shengong/exert/" + action;
}
