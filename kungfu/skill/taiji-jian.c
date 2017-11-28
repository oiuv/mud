// taiji-jian.c 太极剑

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N虚步提腰，一招「蜻蜓点水」，手中$w轻轻颤动，一剑剑点向$n的$l",
        "force" : 25,
        "dodge" : 20,
        "parry" : 25,
        "lvl"   : 0,
        "damage_type" : "刺伤"
]),
([      "action": "$N向前跨上一步，左手剑诀，右手$w使出一式「指南针」直刺$n的$l",
        "force" : 30,
        "dodge" : 25,
        "parry" : 30,
        "lvl"   : 6,
        "damage_type" : "刺伤"
]),
([      "action": "$N身形往右一挫，左手剑诀，右手$w使出一式「大魁星」刺向$n的$l",
        "force" : 30,
        "dodge" : 35,
        "parry" : 35,
        "lvl"   : 12,
        "damage_type" : "刺伤"
]),
([      "action": "$N双膝下沉，右手$w使出一式「探海式」，由下而上疾刺$n的$l",
        "force" : 35,
        "dodge" : 35,
        "parry" : 40,
        "lvl"   : 15,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「燕子掠波」，$w自上而下划出一个大弧，平平地向$n的$l挥去",
        "force" : 35,
        "dodge" : 45,
        "parry" : 45,
        "lvl"   : 18,
        "damage_type" : "刺伤"
]),
([      "action": "$N上身往左侧一拧，一招「乌龙摆尾」，右手$w反手向$n的$l挥去",
        "force" : 35,
        "dodge" : 45,
        "parry" : 55,
        "lvl"   : 21,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「右拦扫」，一招「左拦扫」，剑锋平指，一气呵成横扫$n的$l",
        "force" : 40,
        "dodge" : 60,
        "parry" : 55,
        "lvl"   : 24,
        "damage_type" : "刺伤"
]),
([      "action": "$N左腿提膝，手中$w斜指，一招「宿鸟投林」刺向$n的$l",
        "force" : 40,
        "dodge" : 55,
        "parry" : 60,
        "lvl"   : 27,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「青龙出水」，$w自下而上划出一个大弧，平平地挥向$n的$l",
        "force" : 45,
        "dodge" : 65,
        "parry" : 65,
        "lvl"   : 30,
        "damage_type" : "刺伤"
]),
([      "action": "$N使出「三环套月」，$w划出三个圆圈，剑锋直出，绵绵不断划向$n的$l",
        "force" : 45,
        "dodge" : 70,
        "parry" : 70,
        "lvl"   : 35,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「风卷荷叶」，$w轻灵地划出几个圆弧，迅速地向$n的$l挥去",
        "force" : 50,
        "dodge" : 75,
        "parry" : 80,
        "lvl"   : 40,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「虎抱头」，$w划出一个左低右高的大弧，斜斜地斩向$n的$l",
        "force" : 50,
        "dodge" : 75,
        "parry" : 80,
        "lvl"   : 45,
        "damage_type" : "刺伤"
]),
([      "action": "$N使出「狮子摇头」，$w由右向左划出一个大８字，将$n圈在其中",
        "force" : 55,
        "dodge" : 85,
        "parry" : 80,
        "lvl"   : 50,
        "damage_type" : "刺伤"
]),
([      "action": "$N左脚踏实，右脚虚点，一招「仙人指路」，右手$w带着一团剑花，逼向$n的$l",
        "force" : 55,
        "dodge" : 95,
        "parry" : 80,
        "lvl"   : 60,
        "damage_type" : "刺伤"
]),
([      "action": "$N轻轻跃起，一招「野马跳涧」，$w在半空中化为一圈银芒，落向$n的$l",
        "force" : 60,
        "attack": 3,
        "dodge" : 95,
        "parry" : 90,
        "lvl"   : 80,
        "damage_type" : "刺伤"
]),
([      "action": "$N两腿前箭后弓，一招「射雁式」，右手$w直刺$n的$l",
        "force" : 65,
        "attack": 5,
        "dodge" : 100,
        "parry" : 100,
        "lvl"   : 100,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「小魁星」，身形往左一挫，左手剑诀，右手$w平平地向$n的$l挥去",
        "force" : 70,
        "attack": 7,
        "dodge" : 100,
        "parry" : 105,
        "damage": 1,
        "lvl"   : 110,
        "damage_type" : "刺伤"
]),
([      "action": "$N猱身扑上，一招「白猿献果」，手中$w斜斜地向$n的$l挥去",
        "force" : 75,
        "attack": 10,
        "dodge" : 110,
        "parry" : 120,
        "damage": 2,
        "lvl"   : 120,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「迎风掸尘」，$w看似随意地一挥，$n却陡觉一股劲气迎面袭来。",
        "force" : 80,
        "attack": 12,
        "dodge" : 105,
        "parry" : 115,
        "damage": 4,
        "lvl"   : 130,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「顺水推舟」，$w自上而下划出一个大弧，平平地向$n的$l挥去。",
        "force" : 85,
        "attack": 15,
        "dodge" : 115,
        "parry" : 125,
        "damage": 5,
        "lvl"   : 140,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「流星赶月」，$w疾刺$n的$l",
        "force" : 90,
        "attack": 18,
        "dodge" : 135,
        "parry" : 125,
        "damage": 8,
        "lvl"   : 150,
        "damage_type" : "刺伤"
]),
([      "action": "$N突然盘蹲下身来，一招「海底捞月」，$w自下而上地向$n的$l挥去",
        "force" : 95,
        "attack": 20,
        "dodge" : 125,
        "parry" : 125,
        "damage": 12,
        "lvl"   : 160,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「挑帘式」，$w自下而上徐徐划出一个大弧，平平地向$n的$l挥去",
        "force" : 100,
        "attack": 22,
        "dodge" : 135,
        "parry" : 145,
        "damage": 17,
        "lvl"   : 170,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「黄蜂入洞」，$w自上而下划出一个大弧，平平地向$n的$l挥去",
        "force" : 105,
        "attack": 25,
        "dodge" : 140,
        "parry" : 165,
        "damage": 20,
        "lvl"   : 180,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「大鹏展翅」，身形跃起，右手$w刺向$n的$l",
        "force" : 110,
        "attack": 28,
        "dodge" : 145,
        "parry" : 155,
        "damage": 22,
        "lvl"   : 190,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「车轮剑」，$w化作一片银盘，平平地向$n的$l卷去",
        "force" : 115,
        "attack": 28,
        "dodge" : 155,
        "parry" : 175,
        "damage": 25,
        "lvl"   : 200,
        "damage_type" : "刺伤"
]),
([      "action": "$N左脚轻点地面，身形往前一扑，一招「天马行空」，$w向$n的$l挥去",
        "force" : 120,
        "attack": 29,
        "dodge" : 165,
        "parry" : 180,
        "damage": 31,
        "lvl"   : 210,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「风扫梅花」，身体跃在半空，手中$w扫向$n的$l",
        "force" : 125,
        "attack": 32,
        "dodge" : 175,
        "parry" : 185,
        "damage": 33,
        "lvl"   : 220,
        "damage_type" : "刺伤"
]),
([      "action": "$N一招「却步抽剑」，左脚跃步落地，$w回抽，反手勾向$n的$l",
        "force" : 130,
        "attack": 35,
        "dodge" : 185,
        "parry" : 200,
        "damage": 34,
        "lvl"   : 230,
        "damage_type" : "刺伤"
]),
([      "action": "$N右腿半屈般蹲，一招「如封似闭」，剑尖虚指，转身撩向$n的$l",
        "force" : 135,
        "attack": 38,
        "dodge" : 185,
        "parry" : 220,
        "damage": 37,
        "lvl"   : 240,
        "damage_type" : "刺伤"
]),
([      "action" : "$N回身拧腰，右手虚抱，一招「拨云瞻日」，$w中宫直进，刺向$n的$l",
        "force" : 150,
        "attack": 40,
        "dodge" : 220,
        "parry" : 220,
        "damage": 40,
        "lvl" : 250,
        "damage_type" : "刺伤"
]),
});


int valid_enable(string usage) { return (usage == "sword") || (usage == "parry"); }

int valid_learn(object me)
{
        if ((int)me->query("int") < 26)
                return notify_fail("你先天悟性太差，难以领会太极剑的要诣。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("taiji-quan", 1) < 100)
                return notify_fail("你的太极拳火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法水平有限，无法修炼太极剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("taiji-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的太级剑法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("taiji-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];

}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;
        object m_weapon;

        if ((int) me->query_skill("taiji-jian", 1) < 100 ||
            ! (m_weapon = me->query_temp("weapon")) ||
            ! living(me) || m_weapon->query("skill_type") != "sword")
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force") + mp;
        dp = me->query_skill("parry", 1) / 2 +
             me->query_skill("taiji-jian", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(3))
                {
                case 0:
                        result += (["msg" : HIC "$n" HIC "一抖手中的" + m_weapon->name() +
                                            HIC "，划出了一个圆圈，竟然让$N" +
                                            HIC "的攻击全然落空。\n" NOR]);
                        break;

                case 1:
                        result += (["msg" : HIC "$n" HIC "手中" + m_weapon->name() + HIC
                                            "轻挑，正指向$N" HIC "攻势中的破绽。\n" NOR]);
                        break;

                default:
                        result += (["msg" : HIC "$n" HIC "晃动手中的" + m_weapon->name() +
                                            HIC "，不住的变幻剑势，让$N"
                                            HIC "完全无法捕捉到力道。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(2))
                {
                case 0:
                        result = HIY "$n" HIY "一抖手中的" + m_weapon->name() +
                                 HIY "，划出了一个圆圈，$N"
                                 HIY "理也不理，当即挥招直入，进袭$n"
                                 HIY "！\n" NOR;
                        break;

                case 1:
                        result = HIY "$n" HIY "手中" + m_weapon->name() + HIY "轻挑，"
                                 HIY "正指向$N" HIY "攻势中的破绽，可是$N"
                                 HIY "身形一变，破绽立刻不成为破绽。\n" NOR;
                        break;

                default:
                        result = HIY "$n" HIY "晃动手中的" + m_weapon->name() +
                                 HIY "，不住的变幻剑势，然而$N"
                                 HIY "算理深厚，精演天数，丝毫不受$n"
                                 HIY "的迷惑。\n"  NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力不够练太极剑法。\n");

        if ((int)me->query("neili") < 75)
                return notify_fail("你的内力不够练太极剑法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -64);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"taiji-jian/" + action;
}

int query_effect_parry(object attacker, object me) 
{
        object weapon;
        int lvl;

        if (! objectp(weapon = me->query_temp("weapon")) ||
           (string)weapon->query("skill_type") != "sword")
                return 0;

        lvl = me->query_skill("taiji-jian", 1);
        if (lvl < 80)  return 0;
        if (lvl < 200) return 50;
        if (lvl < 280) return 80;
        if (lvl < 350) return 100;
        return 120;
}