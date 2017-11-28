// fanliangyi-dao.c 反两仪刀法

#include <ansi.h>
#include <skill.h>
#include <weapon.h>
#include <combat.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w斜指，一招「混沌一破」，反身一顿，一刀向$n的$l撩去",
        "force" : 120,
        "dodge" : -10,
        "lvl" : 0,
        "skill_name" : "混沌一破",
        "damage_type" : "割伤"
]),
([      "action" : "$N一招「太乙生萌」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force" : 140,
        "dodge" : -10,
        "damage" : 5,
        "lvl" : 20,
        "skill_name" : "太乙生萌",
        "damage_type" : "割伤"
]),
([      "action" : "$N展身虚步，提腰跃落，一招「两仪合德」，刀锋化作两股斩向$n",
        "force" : 160,
        "dodge" : -5,
        "damage" : 15,
        "lvl" : 40,
        "skill_name" : "两仪合德",
        "damage_type" : "割伤"
]),
([      "action" : "$N一招「日月晦明」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force" : 180,
        "dodge" : 5,
        "damage" : 25,
        "lvl" : 60,
        "skill_name" : "日月晦明",
        "damage_type" : "割伤"
]),
([      "action" : "$N手中$w一沉，一招「无色无相」，双手持刃拦腰反切，砍向$n的胸口",
        "force" : 200,
        "dodge" : 10,
        "damage" : 28,
        "lvl" : 80,
        "skill_name" : "无色无相",
        "damage_type" : "割伤"
]),
([      "action" : "$N挥舞$w，使出一招「万劫不复」，上劈下撩，左挡右开，齐齐罩向$n",
        "force" : 250,
        "dodge" : 15,
        "damage" : 30,
        "lvl" : 100,
        "skill_name" : "万劫不复",
        "damage_type" : "割伤"
])
});


int valid_enable(string usage)
{
        return usage == "blade" ||
               usage == "parry" ||
               usage == "array";
}

/*
int form_array(object leader)
//int perform(object leader, object target)
{
        object *member,ob, weapon;
        int i,j,n;
        int max,min,skill;

        member = leader->query_team();
        if( sizeof(member) != 2 )
                return notify_fail("反两仪刀共需两人，少一个多一个都不行。\n");

        j=sizeof (member);
        for (i=0;i<j;i++)
        {
                ob=member[i];
                if (!ob||!living(ob)||!ob->is_character())
                {
                        return notify_fail("你想和谁同使反两仪刀？\n");
                }
                if (ob->query_temp("array/name"))
                {
                        return notify_fail("已经组成刀阵了。\n");
                }
                if (environment(leader)!=environment(ob))
                {
                        return notify_fail("人数不够两人。\n");
                }
                if (!ob->query_skill("fanliangyi-dao",1))
                {
                        return notify_fail(ob->name()+"还不会反两仪刀法。\n");
                }
                if (ob->is_ghost())
                {
                        return notify_fail("只有阳间的人才能组刀阵。\n");
                }

                if( (int)ob->query("max_neili") < 50 )
                        return notify_fail(ob->query("name")+"的内力不够。\n");

                if( (string)ob->query_skill_mapped("force")!= "zixia-shengong")
                        return notify_fail(ob->query("name")+"没有使用华山派内功。\n");

                if( !(weapon = ob->query_temp("weapon"))
                ||      (string)weapon->query("skill_type") != "blade" )
                        return notify_fail(ob->query("name")+"必须拿把刀做武器。\n");

                if( (int)ob->query_skill("fanliangyi-dao",1)<30)
                        return notify_fail(ob->query("name")+"的反两仪刀法还不够熟练。\n");

                if( (string)ob->query_skill_mapped("blade")!="fanliangyi-dao")
                        return notify_fail(ob->query("name")+"必须使用反两仪刀法。\n");

        }

//get the average array skill of the team
        n=0;
        for (i=0;i<j;i++)
        {
                ob=member[i];
                n+=(int)ob->query_skill("fanliangyi-dao",1);
        }
        n/=2;

//get the difference of the array skill,
//first get the max and mix skill level of the array
        max=member[0]->query_skill("fanliangyi-dao",1);
        min=max;
        for (i=0;i<j;i++)
        {
                skill=member[i]->query_skill("fanliangyi-dao",1);
                if(skill>max)
                        max=skill;
                else if(skill<min)
                        min=skill;
        }

//and the leader is important
        n += leader->query_skill("fanliangyi-dao", 1) * 5;
        n /= max - min + 1;
        for (i=0;i<j;i++)
        {
                ob=member[i];
                ob->set_temp("no_quit",1);

                ob->set_temp("array/name","fanliangyi-dao");
                ob->set_temp("array/level",n);

                ob->add_temp("apply/attack",n);
                ob->add_temp("apply/defense", n);
                ob->add_temp("apply/damage",n);
                ob->add_temp("apply/armor", n);
        }
        message_vision( HIG "$N率领$N站定两仪方位，顿时两人之间显得浑然天成、毫无破绽。\n" NOR, leader);
        return 1;
}

int dismiss_array(object person)
{
        int i,j,n;
        object *member,ob;

        member = person->query_team();
        j=sizeof(member);
        n=person->query_temp("array/level");
        for (i=0;i<j;i++)
        {
                ob=member[i];
                ob->delete_temp("array");
                ob->add_temp("apply/attack",-n);
                ob->add_temp("apply/damage",-n);
                ob->add_temp("apply/defense",-n);
                ob->add_temp("apply/armor", -n);
                tell_object(ob,"刀阵解散了\n");
        }
}

//if the leader kills enemy, then all members in the array kill enemy
int array_kill(object leader, object enemy)
{
        object *member, ob;
        int i,j;
        member=leader->query_team();
        j=sizeof(member);

        for(i=0;i<j;i++) {
                ob=member[i];
                ob->kill_ob(enemy);
        }

        return 1;
}

*/

int effective_level() { return 120;}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 150)
                return notify_fail("你的内力修为不够，无法修炼。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候太浅。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("fanliangyi-dao",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练反两仪刀法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不足，无法练习反两仪刀法，\n");

        me->receive_damage("qi", 40);
        me->add("neili", -41);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fanliangyi-dao/" + action;
}

