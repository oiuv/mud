// jinshe-jian.c
// Modify by Rcwiz for heros.cd

#include <ansi.h>
inherit SKILL;

string *parry_msg = ({
        "$n不退反进，气走周天，手中的$v狠狠磕开了$N的$w。\n",
	"$n回剑自守，架住了$N的$w。\n",
	"$n手中的$v化作千百把，护住了全身。\n",
	"$n手中的$v自上削下，几乎将$N的$w削成两段。\n",
});

mapping *action = ({
([	"skill_name": "金光蛇影",
	"action": "$N使一招「金光蛇影」，手中的$w在一弹指间已向$n的$l连刺数剑",
	"force" : 190,
	"attack": 95,
	"dodge" : 170,
	"parry" : 90,
	"damage": 155,
	"damage_type": "刺伤"
]),
([	"skill_name": "蛇影万道",
	"action": "$N使一招「蛇影万道」，手中$w狂风骤雨般地向$n的$l连攻数剑",
	"force" : 220,
	"attack": 122,
	"dodge" : 210,
	"parry" : 120,
	"damage": 177,
	"damage_type": "刺伤"
]),
([	"skill_name": "雪地飞蛇",
	"action": "$N身形一转，陡地贴地跃起，手中$w灵动夭跃，一招「雪地飞蛇」疾刺$n的$l",
	"force" : 180,
	"attack": 56,
        "dodge" : 160,
        "parry" : 70,
	"damage": 105,
	"damage_type": "刺伤"
]),
([	"skill_name": "金蛇吞信",
	"action": "$N身形一转，一招「金蛇吞信」，手中的$w从左肋下向$n的$l戳了过去",
	"force" : 210,
	"attack": 88,
	"dodge" : 180,
	"parry" : 90,
	"damage": 112,
	"damage_type": "刺伤"
]),
([	"skill_name": "金蛇狂舞",
	"action": "$N手腕一抖，一招「金蛇狂舞」，$w挟著闪闪剑光，变幻无方逼向$n的$l",
	"force" : 240,
	"attack": 82,
	"dodge" : 180,
	"parry" : 90,
	"damage": 125,
	"damage_type": "刺伤"
]),
([	"skill_name": "灵蛇电闪",
	"action": "$N心念电闪手腕疾振处，一招「灵蛇电闪」，$w以无法形容的速度直射$n的$l",
	"force" : 260,
	"attack": 95,
	"dodge" : 180,
	"parry" : 100,
	"damage": 130,
	"damage_type": "刺伤"
]),
([	"skill_name": "蛇困愁城",
	"action": "$N身形一矮，一招「蛇困愁城」，手中的$w由下往上刺向$n的$l",
	"force" : 300,
	"attack": 102,
	"dodge" : 200,
	"parry" : 120,
	"damage": 165,
	"damage_type": "刺伤"
]),
([	"skill_name": "金蛇化龙",
	"action": "$N手中$w剑光暴长，一招「金蛇化龙」，如千年蛇蝎往$n$l咬去",
	"force" : 320,
	"attack": 120,
	"dodge" : 220,
	"parry" : 140,
	"damage": 200,
	"damage_type": "刺伤"
]),
});

string query_skill_name(int level)
{
        return action[random(sizeof(action))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
	return action[random(sizeof(action))];
}
/* 装备金蛇剑才有特效
mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;
        object weapon;
        int i, ap, dp;

        lvl = me->query_skill("jinshe-jian", 1);

        if (me->query("neili") < 300
           || me->query_skill_mapped("sword") != "jinshe-jian"
           ||! objectp(weapon = me->query_temp("weapon"))
           || weapon->query("skill_type") != "sword")
                     return 0;

        ap = me->query_skill("sword");
        dp = victim->query_skill("dodge");

        me->add("neili", -80);

        switch(random(5))
        {
           case 1:
             break;

           case 2:
             break;

          case 3:
             break;
          
          case 4:
             if (ap / 2 + random(ap) > dp &&
                 ! me->is_busy() &&
                 ! victim->is_busy())
             {
                 message_sort(HIW "\n$N" HIW "剑锋一转，手中" + weapon->name() + HIW
                              "犹如灵蛇般地舞动着，竟将$n" HIW "周身缠绕。\n" NOR); 
                 me->start_busy(1);
                 victim->start_busy(1 + random(lvl / 20));
             }
             break;                        
          
          default :
             if (ap * 3 / 5 + random(ap) > dp && 
                 ! me->is_busy() &&
                 ! me->query_temp("jinshe-jian/lian"))
             {
                weapon = me->query_temp("weapon");
                message_sort(HIY "\n$N" HIY "一声长吟，手中" + weapon->name() + HIY 
                             "顿时化作一条灵蛇，迅捷无比地袭向$n" HIY "。\n" NOR,
                             me, victim);

                me->add("neili", -180);
              
                me->set_temp("jinshe-jian/lian", 1);
                for (i = 0; i < 9; i++)
                {
                    if (! me->is_fighting(victim))
                            break;
                   
                    if (! victim->is_busy() && random(2) == 1)
                            victim->start_busy(1);

                    COMBAT_D->do_attack(me, victim, weapon, 0);
                }
                me->delete_temp("jinshe-jian/lian");
                
             }
             break;                        
       }
}
*/
int valid_learn(object me)
{

        if (me->query("int") < 33)
                return notify_fail("你先天悟性不足，无法领悟金蛇剑法。\n");

        if (me->query("dex") < 33)
                return notify_fail("你先天身法不足，无法修习金蛇剑法。\n");

	if ((int)me->query("max_neili") < 4000)
		return notify_fail("你的内力修为不够，没有办法练金蛇剑法。\n");

	if ((int)me->query_skill("force", 1) < 200)
		return notify_fail("你的基本内功火候不够，没有办法练金蛇剑法。\n");

	if ((int)me->query_skill("dodge", 1) < 240)
		return notify_fail("你的基本轻功火候不够，没有办法练金蛇剑法。\n");

	if ((int)me->query_skill("sword", 1) < 220)
		return notify_fail("你的基本剑法火候不够，没有办法练金蛇剑法。\n");

	if ((int)me->query_skill("martial-cognize", 1) < 220)
		return notify_fail("你的武学修养不足，没有办法领悟金蛇剑法。\n");

        if (me->query("character") == "心狠手辣")
                return notify_fail("你一心想杀尽敌人，没能理解金蛇剑法。\n");

        if (me->query("character") == "阴险奸诈")
                return notify_fail("你一心想怎么学好剑法去害人，结果没能理解金蛇剑法。\n");

        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗道：什么金蛇剑法，乱七八糟的，没有半点气势。\n");

	if ((int)me->query_skill("sword", 1) < (int)me->query_skill("jinshe-jian", 1))
		return notify_fail("你的基本剑法水平有限，无法领会更高深的金蛇剑法。\n");

        return 1;
}

int valid_enable(string usage)
{
	return usage == "sword" || usage == "parry";
}

int practice_skill(object me)
{
	object ob;

	if (! (ob = me->query_temp("weapon")) ||
	    (string)ob->query("skill_type") != "sword")
		return notify_fail("你必须先找一把剑才能练剑法。\n");

	if ((int)me->query("qi") < 80)
		return notify_fail("你的气不够，没有办法练习金蛇剑法。\n");

	if ((int)me->query("neili") < 80)
		return notify_fail("你的内力不够，没有办法练习金蛇剑法。\n");

	me->receive_damage("qi", 70);
	me->add("neili", -70);
	return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jinshe-jian/" + action;
}

