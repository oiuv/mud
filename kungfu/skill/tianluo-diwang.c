#include <ansi.h>;

inherit SKILL;

mapping *action = ({
([      "action" : "$N左掌划一半圆，右掌划出另一半圆，呈合拢之势，疾拍$n的胸前大穴",
        "force"  : 160,
        "attack" : 10,
        "parry"  : 10,
        "dodge"  : 10,
        "damage" : 10,
        "lvl"    : 0,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N左掌护胸，右拳凝劲后发，深吸一口气，缓缓推向$n的$l",
        "force"  : 195,
        "attack" : 20,
        "parry"  : 25,
        "dodge"  : 15,
        "damage" : 15,
        "damage_type" : "瘀伤",
        "lvl"    : 30,
]),
([      "action" : "$N纵身向前扑去，一下急冲疾缩，就在两臂将合未合之际，双手抱向$n的$l",
        "force"  : 230,
        "attack" : 30,
        "parry"  : 30,
        "dodge"  : 20,
        "damage" : 32,
        "lvl"    : 60,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N两掌上下护胸，掌势突然一变，骤然化为满天掌雨，攻向$n",
        "force"  : 260,
        "attack" : 40,
        "parry"  : 40,
        "dodge"  : 20,
        "damage" : 40,
        "damage_type" : "瘀伤",
        "lvl"    : 90,     
]),
([      "action" : "$N长袖挥处，两股袖风扑出，$n只觉得密不透风，周身都是掌印，怎么也闪躲不开",
        "force"  : 270,
        "attack" : 50,
        "parry"  : 55,
        "dodge"  : 35, 
        "damage" : 65,
        "lvl"    : 120,        
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双臂飞舞，两只手掌宛似化成了千手千掌，任$n如何跃腾闪躲，始终飞不出"
                   "只掌所围作的圈圈", 
        "force"  : 300,
        "attack" : 65,
        "parry"  : 70,
        "dodge"  : 40,
        "damage" : 80,
        "lvl"    : 150,
        "damage_type" : "瘀伤"
]), 
});

int valid_enable(string usage) 
{ 
        int lvl;
        lvl = (int)this_player()->query_skill("tianluo-diwang", 1);
        
        if (lvl > 30)
               return usage == "strike" || usage == "parry";
        else
               return  usage == "strike";
}

int valid_combine(string combo)
{ 
        return combo == "meinv-quan"; 
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手方能练习天罗地网掌。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功基础不够，无法修习天罗地网掌。\n");

        if ((int)me->query_skill("strike", 1) < 40)
                return notify_fail("你的基本掌法水平太低，无法研习天罗地网掌。\n");

        if ((int)me->query_skill("strike", 1) < me->query_skill("tianluo-diwang", 1))
                return notify_fail("你的基本掌法水平水平有限，无法研习更高深的天罗地网掌。\n");

        return 1;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("tianluo-diwang", 1) < 100 ||
            ! living(me) || me->query_temp("weapon"))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force") + mp;
        dp = me->query_skill("parry", 1) / 2 +
             me->query_skill("tianluo-diwang", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(2))
                {
                case 0:                                             
                                            
                        result += (["msg" : HIC "$n" HIC "双臂飞舞，似有千掌拍出，密"
                                            HIC "不透风，竟将$N" HIC "的攻势化解。\n" NOR]);
                        break;

                default:
                        result += (["msg" : HIC "$n" HIC "掌势突然一变，骤然化为满天掌雨，"
                                            HIC "护于胸前，$N" HIC "竟无从攻击。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 80)
        {
                switch (random(2))
                {
                case 0:
                        result = HIY "$n" HIY "双臂飞舞，似有千掌拍出，密不透风，"
                                 HIY "然而$N" HIY "视之无物，随意出招，进袭$n" 
                                 HIY "！\n" NOR;
                        break;

                default:
                        result = HIY "$n" HIY "掌势突然一变，骤然化为满天掌雨，"
                                 HIY "护于胸前，可是$N" HIY "却看透其中虚实，径"
                                 HIY "直攻向$n\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int query_effect_parry(object attacker, object me)
{
        int lvl;

        if (me->query_temp("weapon"))
                return 0;

        lvl = me->query_skill("tianluo-diwang", 1);
        if (lvl < 60)  return 0;
        if (lvl < 160) return 40;
        if (lvl < 240) return 60;
        if (lvl < 320) return 80;
        return 100;
}

mapping query_action(object me, object weapon)
{
        int i, level;

        level = (int)me->query_skill("tianluo-diwang", 1);

        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -35);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianluo-diwang/" + action;
}
