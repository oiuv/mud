#include <ansi.h>
inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;
        
        if (me->query("sex"))
		    return 0;

        lvl = (int)me->query_skill("xiantian-gong", 1);
        return lvl * lvl * 15 * 22 / 100 / 200;
}

int valid_force(string force)
{
        return force == "quanzhen-xinfa" ||
               force == "duanshi-xinfa" ||
               force == "suxin-jue" ||
               force == "yunv-xinjing" ||
               force == "kurong-changong" ||
               force == "xuanmen-neigong";
}

mapping *action = ({
([      "action" : "$N单掌一抖，运聚先天功功力，呼啸着向$n的$l处拍去",
        "dodge"  : 87,
        "force"  : 430,
        "attack" : 163,
        "parry"  : 81,
        "damage" : 83,
        "damage_type": "内伤" 
]), 
([      "action" : "$N右掌平伸，左掌运起先天功的劲力，猛地拍向$n的$l",
        "dodge"  : 85,
        "force"  : 440,
        "attack" : 147,
        "parry"  : 77,
        "damage" : 81,
        "damage_type": "内伤"
]), 
([      "action" : "$N身形一展，右掌护住心脉，左掌中攻直进，贯向$n$l",
        "dodge"  : 75,
        "force"  : 450,
        "attack" : 182,
        "parry"  : 67,
        "damage" : 93,
        "damage_type": "内伤"
]),
([      "action" : "$N运转先天真气，双掌回圈，顿时一波澎湃的气劲直袭$n",
        "dodge"  : 87,
        "force"  : 480,
        "attack" : 183,
        "parry"  : 85,
        "damage" : 105,
        "damage_type": "内伤"
]), 
});

int valid_enable(string usage)
{ 
        int lvl;
        lvl = (int)this_player()->query_skill("xiantian-gong", 1);

        if (lvl >= 180)    
                return usage == "force" || usage == "unarmed" || usage == "parry";
        else
                return usage == "force";
       
}

int valid_learn(object me)
{
        if (me->query("character") != "光明磊落"
           && me->query("character") != "国士无双")
                return notify_fail("你只觉先天功正大恢弘，依自己的天性似乎难以领悟。\n");

        if ((int)me->query("int") < 34)
                return notify_fail("你的先天悟性不足，难以领会高深的先天功。\n");

        if ((int)me->query("con") < 34)
                return notify_fail("你的先天根骨孱弱，无法修炼高深的先天功。\n");

        //if ( me->query("gender") == "无性" && me->query("xiantian-gong", 1) > 29)
        //        return notify_fail("你无根无性，阴阳不调，难以领会高深的先天功。\n");
        if ((string)me->query("gender") != "男性") 
        	      return notify_fail("先天功乃是纯阳玄功，只有男子方可修习。\n");

        if ((int)me->query_skill("taoism", 1) < 200)
                return notify_fail("你对道学心法的理解不够，难以领会先天功。\n");

        if ((int)me->query_skill("force", 1) < 200)
                return notify_fail("你的基本内功火候不足，难以领会先天功。\n");

        if ((int)me->query_skill("unarmed", 1) < 200)
                return notify_fail("你的基本拳脚火候不足，难以领会先天功。\n");

        //if ((int)me->query("max_neili", 1) < 4000)
        if ((int)me->query("max_neili", 1) < 3500)
                return notify_fail("你的内力修为不足，难以领会先天功。\n");

        if (me->query_skill("taoism", 1) < 320
           && me->query_skill("taoism", 1) < me->query_skill("xiantian-gong", 1))
                return notify_fail("你对道学心法的理解不够，难以锻炼更深厚的先天功。\n");

        if (me->query_skill("force", 1) < me->query_skill("xiantian-gong", 1))
                return notify_fail("你的基本内功水平不够，难以锻炼更深厚的先天功。\n");

        if (me->query_skill("unarmed", 1) < me->query_skill("xiantian-gong", 1))
                return notify_fail("你的基本拳脚水平不够，难以锻炼更深厚的先天功。\n");

        return ::valid_learn(me);
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;

        lvl = me->query_skill("xiantian-gong", 1);

        if (damage_bonus < 150
           || lvl < 180
           || me->query("neili") < 300
           || me->query_temp("weapon")
           || me->query_temp("secondary_weapon")
           || me->query_skill_mapped("force") != "xiantian-gong"
           || me->query_skill_mapped("unarmed") != "xiantian-gong"
           || me->query_skill_prepared("unarmed") != "xiantian-gong")
                return 0;

        if (damage_bonus / 6 > victim->query_con())
        {
                me->add("neili", -30);
                victim->receive_wound("qi", (damage_bonus - 100) / 3, me);
                return HIW "$N" HIW "先天功的潜力发挥了出来，突然间$n"
                       HIW "只感喉咙一甜，喷出一口鲜血！\n" NOR;
        }
}

int practice_skill(object me)
{
        return notify_fail("先天功只能用学(learn)来增加熟练度。\n");
}

int difficult_level()
{
        return 500;
}

string perform_action_file(string action)
{
        return __DIR__"xiantian-gong/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"xiantian-gong/exert/" + action;
}
