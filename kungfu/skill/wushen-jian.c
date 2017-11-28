// wushen-jian.c 衡山五神剑
// 由衡山派紫盖剑法、芙蓉剑法、石廪剑法、祝融剑法、天柱剑
// 法合一所创，B+级器械武学。

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      
        "action" : "$N反转手中$w，剑光夺目，将「" HIR "祝融剑法" NOR
                   "」发挥得淋漓尽致，闪电般射向$n",
        "force" : 430,
        "attack": 147,
        "dodge" : 96,
        "parry" : 128,
        "damage": 190,
        "damage_type" : "刺伤",
]),
([ 
        "action" : "$N手中剑花突现，顿时剑光暴长，已将「" HIM "芙蓉剑"
                   "法" NOR "」使出，直刺$n的$l",
        "force" : 420,
        "attack": 154,
        "dodge" : 118,
        "parry" : 120,
        "damage": 210,
        "damage_type" : "刺伤",
]),
([
        "action" : "$N将$w一挥，长啸一声腾空而起，一式「" HIY "鹤翔紫"
                   "盖" NOR "」，$w已指向$n$l",
        "force" : 420,
        "attack": 156,
        "dodge" : 100,
        "parry" : 120,
        "damage": 223,
        "damage_type" : "刺伤",
]),
([
        "action" : "$N轻啸一声，右手$w虚刺$n左眼，突然右腕翻转，将「" HIG 
                   "石廪剑法" NOR "」的精髓发挥到了极致",
        "force" : 430,
        "attack": 160,
        "dodge" : 120,
        "parry" : 140,
        "damage": 248,
        "damage_type" : "刺伤",
]),
([
        "action" : "$N手中$w剑路忽快忽慢，若隐若现，一剑「" HIW "天柱云气"
                   NOR "」犹如烟雾飘渺般使了出来",
        "force" : 480,
        "attack": 180,
        "dodge" : 140,
        "parry" : 160,
        "damage": 260,
        "damage_type" : "刺伤",
]),
});

string main_skill()
{
        return "wushen-jian";
}

mapping sub_skills = ([
        "zigai-jian"   : 180,
        "furong-jian"  : 180,
        "shilin-jian"  : 180,
        "zhurong-jian" : 180,
        "tianzhu-jian" : 180,
]);

int get_ready(object me)
{
        return 1;
}

int get_finish(object me)
{
        object ob;
        me = this_player();

        if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
        {
                tell_object(me, "你空手舞了半天，发现如果不用剑实在难以演练。\n");
                return 0;
        }

        if (me->query("int") < 30)
        {
                tell_object(me, "你演练完毕，只感五种剑法毫无牵连，看来依你的悟"
                                "性，无法将其合一。\n");
                return 0;
        }

        if (me->query("dex") < 28)
        {
                tell_object(me, "你演练完毕，只觉依自己的身法灵动性，根本无法将"
                                "五种剑法合一。\n");
                return 0;
        }

        if (me->query_skill("martial-cognize", 1) < 180)
        {
                tell_object(me, "你演练完毕，发现自己的武学修养尚待提高，暂且无"
                                "法将五种剑法合一。\n");
                return 0;
        }

        if ((int)me->query("max_neili") < 3200)
        {
                tell_object(me, "你突然觉得真气不继，看来依自己的内力修为，无法"
                                "将五种剑法合一。\n");
                return 0;
        }

        if (random(20) < 17)
        {
                tell_object(me, "你觉得有所感悟，或许再演练一次就能融会贯通，将"
                                "五种剑法合一。\n");
                return 0;
        }

        tell_object(me, HIY "\n一阵凡尘往事涌上心头，你几欲放声长叹。霎那间衡山"
                        "派五种剑法不断在\n你的脑海里交替闪现，最后终于融会贯通"
                        "，合为一体。你终于通晓了衡山\n五神剑的诀窍。\n" NOR);
        return 1;
}

mapping query_sub_skills()
{
        return sub_skills;
}

int valid_enable(string usage)
{
        return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        object ob;

        if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
                return notify_fail("你必须先找一柄剑才能够练习。\n");

        if (me->query("int") < 30)
                return notify_fail("你的先天悟性不足，没有办法练衡山五神剑。\n");

        if (me->query("dex") < 28)
                return notify_fail("你的先天身法孱弱，没有办法练衡山五神剑。\n");

        if (me->query_skill("martial-cognize", 1) < 180)
                return notify_fail("你觉得衡山五神剑极其深奥，依照自己的武学修养"
                                   "难以理解。\n");

        if ((int)me->query("max_neili") < 4000)
                return notify_fail("你的内力修为不够，没有办法练衡山五神剑。\n");

        if ((int)me->query_skill("sword", 1) < 200)
                return notify_fail("你的基本剑法太差，没有办法练衡山五神剑。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("wushen-jian", 1))
                return notify_fail("你的基本剑法火候有限，无法领会更高深的衡山五神剑。\n");

        return 1;
}
string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action); i > 0; i--)
                if(level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

int practice_skill(object me)
{
        int cost;

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        cost = me->query_skill("wushen-jian", 1) / 2 + 60;

        if ((int)me->query("neili") < cost)
                return notify_fail("你的内力不够练衡山五神剑。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -cost);
        return 1;
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}
void skill_improved(object me)
{
        int i;
        string *sub_skillnames;

        sub_skillnames = keys(sub_skills);

        for (i = 0; i < sizeof(sub_skillnames); i++)
                me->delete_skill(sub_skillnames[i]);
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;
        object weapon;
        int i;

        lvl = me->query_skill("wushen-jian", 1);

        if (damage_bonus < 135
           || me->query("neili") < 500
           || me->query_skill_mapped("sword") != "wushen-jian"
           || random(2) != 1)
                     return 0;

        switch(random(4))
        {
           case 1:
              if (damage_bonus / 5 > victim->query_con())
              {
                  me->add("neili", -100);
                  victim->receive_wound("qi", (damage_bonus - 54) / 2, me);
                  
                  return random(2) ? HIW "$N" HIW "一剑攻出，刹那间剑气横飞，$n" HIW
                                     "身上顿时鲜血狂涌。\n" NOR:
                                     HIW "$N" HIW "剑锋一转，一剑平平刺向$n" HIW "要害"
                                     "，看似普通的一招其中却蕴藏着极大的杀着。\n" NOR;
             }
             break;

          case 2:
             if (random(me->query_skill("sword") / 2) + me->query_skill("sword")
                 > victim->query_skill("dodge"))
             {
                  weapon = me->query_temp("weapon");
                  me->start_busy(1);
                  victim->start_busy(2 + random(lvl / 60));
                  return   HIC "$N" HIC "剑法陡然变快，手中" + weapon->name() + HIC "剑光夺目，"
                           "将$n" HIC "笼罩在剑光之中。\n" NOR;
             }
             break;

          case 3:
             if (lvl > 200 && random(lvl / 2) + lvl > victim->query_skill("parry", 1) && ! me->is_busy()
                 && random(2) == 1 && ! me->query_temp("perform_wushenjian/qian"))
             {
                weapon = me->query_temp("weapon");
                message_sort(HIM "\n$N" HIM "轻啸一声，腾空而起，" + weapon->name() + "在"
                             "空中挽出一个剑花，顷刻间剑花四散，洋洋洒洒。犹如无"
                             "数花瓣从半空洒向$n" HIM "全身。\n" NOR, me, victim);
                me->add("neili", -300);
                me->start_busy(2);
                for (i = 0; i < 5; i++)
                {
                    if (! me->is_fighting(victim))
                            break;
                   
                    if (! victim->is_busy() && random(2) == 1)
                            victim->start_busy(1);

                    COMBAT_D->do_attack(me, victim, weapon, 0);
                }                
                
             }
             break;                        

          default:
                return 0;
       }
}


int difficult_level()
{
        return 700;
}

string perform_action_file(string action)
{
        return __DIR__"wushen-jian/" + action; 
}
