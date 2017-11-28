#include <ansi.h>
#include <skill.h>

inherit SKILL;

string *xue_name = ({ 
"劳宫穴", "膻中穴", "曲池穴", "关元穴", "曲骨穴", "中极穴", "承浆穴", "天突穴", "百会穴",
"幽门穴", "章门穴", "大横穴", "紫宫穴", "冷渊穴", "天井穴", "极泉穴", "清灵穴", "至阳穴", }); 

mapping *action_finger = ({
([      "action" : "$N右手食指微点，出招「晓天初阳」，一股雄浑的一阳指力射向$n，出手沉稳，招数正大",
        "force" : 350,
        "attack": 80,
        "dodge" : 75,
        "parry" : 55,
        "damage": 70,
        "lvl" : 0,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "晓天初阳",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一指「日出霞光」，激出的一股罡气涌向$n，看似是温淳平和，但沛然浑厚，无可与抗",
        "force" : 370,
        "attack": 81,
        "dodge" : 65,
        "parry" : 65,
        "damage": 72,
        "lvl" : 20,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "日出霞光",
        "damage_type" : "刺伤"
]),
([      "action" : "忽听嗤嗤轻响，一股柔和的气流自$N手指涌出，正是一招「阳春暖融」，缓缓点向$n$l",
        "force" : 410,
        "attack": 85,
        "dodge" : 55,
        "parry" : 55,
        "damage": 88,
        "lvl" : 40,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "阳春暖融",
        "damage_type" : "刺伤"
]),
([      "action": "$N一步跨到$n身后，又如闪电般跃回，一式「鲁阳返日」，右手食指疾出，指向$n的$l",
        "force" : 430,
        "attack": 79,
        "dodge" : 65,
        "parry" : 35,
        "damage": 83,
        "lvl" : 60,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "鲁阳返日",
        "damage_type" : "刺伤"
]),
([      "action": "$N左手轻扬，右手食指挟着雄浑内力疾点$n的$l，招式光明坦荡，正是一式「阳春白雪」",
        "force" : 460,
        "attack": 75,
        "dodge" : 91,
        "parry" : 85,
        "damage": 78,
        "lvl" : 80,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "阳春白雪",
        "damage_type" : "刺伤"
]),
([      "action": "$N身影飘起，一式「阳钩挥天」，身形自上而下闪出，右手猛然劲点向$n的$l",
        "force" : 490,
        "attack": 105,
        "dodge" : 35,
        "parry" : 24,
        "damage": 98,
        "lvl" : 100,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "阳钩挥天",
        "damage_type" : "刺伤"
]),
([      "action" : "$N踏前一步，伸指凌空轻轻一点，$n只觉气息一紧，已被「赤日焦阳」的刚阳气劲触到$l",
        "force" : 480,
        "attack": 95,
        "dodge" : 75,
        "parry" : 75,
        "damage": 93,
        "lvl" : 120,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "赤日焦阳",
        "damage_type" : "刺伤"
]),
([      "action" : "$N衣袖轻摆，罡阳柔气从袖底挥出，涌向$n的$l，正是玄功若神的一招「晓阳云暖」",
        "force" : 512,
        "attack": 105,
        "dodge" : 85,
        "parry" : 85,
        "damage": 97,
        "lvl" : 140,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "晓阳云暖",
        "damage_type" : "刺伤"
]),
([      "action" : "$N面带微笑，伸出右食指，缓缓点向$n胸口，这招「暮云映日」劲气弥漫，却无丝毫破空之声",
        "force" : 540,
        "attack": 113,
        "dodge" : 38,
        "parry" : 38,
        "damage": 89,
        "lvl" : 160,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "暮云映日",
        "damage_type" : "刺伤"
]),
([      "action": "$N左掌斜削，突然间变掌为指，嗤的一声响，一式「丹凤朝阳」，使出一阳指力，疾点$n的$l",
        "force" : 528,
        "attack": 119,
        "dodge" : 24,
        "parry" : 23,
        "damage": 98,
        "lvl" : 180,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "丹凤朝阳",
        "damage_type" : "刺伤"
]),
([      "action" : "只见$N食指微屈，一指「九天乾阳」点出，气象森严，雍容肃穆，于威猛之中不脱王者风度",
        "force" : 569,
        "attack": 97,
        "dodge" : 42,
        "parry" : 42,
        "damage": 117,
        "lvl" : 200,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "九天乾阳",
        "damage_type" : "刺伤"
]),
([      "action" : "$N头顶白气氤氲，渐聚渐浓，便似蒸笼一般，食指伸出，一式「三阳开泰」按向$n$l",
        "force" : 540,
        "attack": 135,
        "dodge" : 75,
        "parry" : 91,
        "damage": 138,
        "lvl" : 220,
        "weapon" : HIR "一阳指力" NOR,
        "skill_name" : "三阳开泰",
        "damage_type" : "内伤"
])
});


mapping *action_staff = ({
([      "action" : "$N嘴角轻笑，提$w平胸，看准时机一杖挥出，激起呼呼风声，迅猛无比地直插$n$l",
        "force" : 100,
        "dodge" : 15,
        "damage" : 50,
        "lvl" : 0,
        "damage_type" : "刺伤",
]),
([      "action" : "$N左手捏个杖诀，右腕传动，将一阳指神功化于$w之上，出杖凝重，平平正正地打向$n",
        "force" : 150,
        "dodge" : -10,
        "damage" : 70,
        "lvl" : 20,
        "damage_type" : "内伤",
]),
([      "action" : "只见$N屏息凝神，脚步沉着，杖走刀势，一式横劈，砍向$n$l，招式威猛正大",
        "force" : 200,
        "dodge" : 0,
        "damage" : 90,
        "lvl" : 40,
        "damage_type" : "割伤",
]),
([      "action" : "$N脚下步法微变，身随杖走，端凝自重，极飘逸的一杖向$n击出，轻灵中却也不失王者气象",
        "force" : 250,
        "dodge" : 10,
        "damage" : 120,
        "lvl" : 60,
        "damage_type" : "刺伤",
]),
([      "action" : "$N平推一杖，手中的$w看似渐渐沉重，使动时略比先前滞涩，但实是举轻若重，威猛之极",
        "force" : 300,
        "dodge" : -15,
        "damage" : 140,
        "lvl" : 80,
        "damage_type" : "刺伤",
]),
});

int valid_enable(string usage) 
{  
	return usage == "finger" || usage == "parry" || usage == "staff"; 
}

int valid_learn(object me)
{
	if ((string)me->query("gender") != "男性") 
        	return notify_fail("一阳指乃是纯阳玄功，你如何可以修习？\n");

        if ((int)me->query("str") < 34)
                return notify_fail("你的先天膂力孱弱，无法领会一阳指。\n");

        if ((int)me->query("dex") < 30)
                return notify_fail("你的先天身法孱弱，无法修炼一阳指。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练一阳指必须空手。\n");

        if ((int)me->query_skill("force") < 240)
                return notify_fail("你的内功火候不够，无法学一阳指。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力太弱，无法练一阳指。\n");

        if ((int)me->query_skill("finger", 1) < 150)
                return notify_fail("你的基本指法火候不够，无法学一阳指。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("sun-finger", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的一阳指。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action_finger)-1; i >= 0; i--)
                if(level >= action_finger[i]["lvl"])
                        return action_finger[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("sun-finger", 1);

        if ( ! weapon)
        {                
             for(i = sizeof(action_finger); i > 0; i--)
                     if(level >= action_finger[i-1]["lvl"])
                             return action_finger[NewRandom(i, 20, level/5)];
        }        
        else
             for(i = sizeof(action_staff); i > 0; i--)
                     if(level > action_staff[i-1]["lvl"])
                             return action_staff[NewRandom(i, 20, level/5)];        
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你的内力不够练一阳指!\n");

        me->receive_damage("qi", 60);
        me->add("neili", -100);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
      	string name, weapon;
      	name = xue_name[random(sizeof(xue_name))];

      	if (victim->is_busy())
            	return 0;

      	if (damage_bonus < 150)
            	return 0;

      	if (! objectp(weapon = me->query_temp("weapon")))
      	{
            	if ((me->query("neili") > 300)
               	   && me->query_skill("sun-finger", 1) > 100
               	   && ! victim->is_busy())
            	{
	          	victim->start_busy(2);
                  	me->add("neili", -50);
                  	victim->receive_wound("qi", (damage_bonus - 100) / 3, me);

			if (victim->query("neili") <= (damage_bonus / 4 + 50))
	                	victim->set("neili", 0);
                  	else
                        	victim->add("neili", -damage_bonus / 4);

		              	return HIR "只听“嗤”的一声，$n" HIR "被$N" HIR "凌空一指点中" NOR +
                                       HIY + name + NOR + HIR "，真气不由得一滞。\n" NOR;
            	} 
      	} else
      	{
            	if ((me->query("neili") > 300)
                   && me->query_skill("sun-finger", 1) > 100
                   && ! victim->is_busy())
	    	{
	        	victim->start_busy(2);
                	me->add("neili", -50);
                  	victim->receive_wound("qi", (damage_bonus - 120) / 3, me);

	                return HIR "只听“嗤”的一声，$n" HIR "被$N" HIR "杖端发出的气劲刺中" NOR +
                               HIY + name + NOR +HIR "，真气不由得一滞。\n" NOR;
            	}   
      	}
 
}

string perform_action_file(string action)
{
      	return __DIR__"sun-finger/" + action;
}