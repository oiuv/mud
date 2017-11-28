// chixin-jian.c 痴心情长剑
// Made by deaner
// Modified by Venus Oct.1997

#include <ansi.h>

inherit SKILL;

mapping *action = ({
   (["skill_name" : "情投意合展欢颜",
     "action" : "$N使一式"+HIC"『情投意合展欢颜』"NOR+"，面露微笑，手中$w一抖，剑光"
                "暴长，洒向$n的$l",
     "dodge"  : 10,
     "force"  : 50,
     "damage" : 10,
     "lvl"    : 0,
     "damage_type":  "刺伤"]),
   (["skill_name" : "突来横祸阴阳隔",
     "action" : "$N使一式"+HIC"『突来横祸阴阳隔』"NOR+"，身形骤闪，剑招陡变，手中$w"
                "从一个绝想不到的方位斜斜刺向$n的$l",
     "dodge"  : 20,
     "force"  : 70,
     "damage" : 5,
     "lvl"    : 10,
     "damage_type":  "刺伤"]),
   (["skill_name" : "朝朝暮暮频思忆",
     "action" : "$N使一式"+HIC"『朝朝暮暮频思忆』"NOR+"，暴退数尺，低首抚剑片刻，随"
                "后手中$w骤然穿上，刺向$n的$l",
     "dodge"  : 20,
     "force"  : 75,
     "damage" : 20,
     "lvl"    : 20,
     "damage_type":  "刺伤"]),
   (["skill_name" : "千里婵娟只是空",
     "action" : "$N使一式"+HIC"『千里婵娟只是空』"NOR+"，身形一晃，疾掠而上，手中$w"
                "龙吟一声，对准$n的$l连递数剑",
     "dodge"  : 40,
     "force"  : 90,
     "damage" : 25,
     "lvl"    : 30,
     "damage_type":  "刺伤"]),
   (["skill_name" : "生生世世长相伴",
     "action" : "$N使一式"+HIC"『生生世世长相伴』"NOR+"，一闪而上扑向$n，如影相随，"
                "手中$w“铮”然有声，往$n的$l刺去",
     "dodge"  : 60,
     "force"  : 100,
     "damage" : 25,
     "lvl"    : 40,
     "damage_type":  "刺伤"]),
   (["skill_name" : "却恨天公不作美",
     "action" : "$N使一式"+HIC"『却恨天公不作美』"NOR+"，一个侧身，手中$w疾往斜上挑"
                "起，直指$n的$l",
     "dodge"  : 50,
     "force"  : 130,
     "damage" : 30,
     "lvl"    : 50,
     "damage_type":  "刺伤"]),
   (["skill_name" : "聚日无多相思苦",
     "action" : "$N使一式"+HIC"『聚日无多相思苦』"NOR+"，微微一个转身，手中$w却已自"
                "肋下穿出，罩向$n的$l",
     "dodge"  : 40,
     "force"  : 150,
     "damage" : 30,
     "lvl"    : 60,
     "damage_type":  "刺伤"]),
   (["skill_name" : "此恨绵绵无绝期",
     "action" : "$N使一式"+HIC"『此恨绵绵无绝期』"NOR+"，神色微变，剑招陡然变得凌厉无"
                "比，手中$w如匹链般洒向$n的$l",
     "dodge"  : 30,
     "force"  : 180,
     "damage" : 40,
     "lvl"    : 70,
     "damage_type":  "刺伤"]),
   (["skill_name" : "黯然神伤泪满面",
     "action" : "$N使一式"+HIC"『黯然神伤泪满面』"NOR+"，缓缓低首，暗自叹了口气，眼中"
                "莹光流动，接着手中$w中宫直进，迅捷无比地往$n的$l刺去",
     "dodge"  : 20,
     "force"  : 200,
     "damage" : 35,
     "lvl"    : 80,
     "damage_type":  "刺伤"]),
   (["skill_name" : "愿人长久空遗恨",
     "action" : "$N使一式"+HIC"『愿人长久空遗恨』"NOR+"，腾身飞跃，手中$w于半空中闪下，"
                "化作一道白色长弧洒向$n的$l",
     "dodge"  : 30,
     "force"  : 220,
     "damage" : 45,
     "lvl"    : 90,
     "damage_type":  "刺伤"]),
   (["skill_name" : "今世未能偕白头",
     "action" : "$N使一式"+HIC"『今世未能偕白头』"NOR+"，矮身侧步，手中$w反手疾挑而出，"
                "“唰”的一声往$n的$l刺去",
     "dodge"  : 65,
     "force"  : 240,
     "damage" : 50,
     "lvl"    : 100,
     "damage_type":  "刺伤"]),
   (["skill_name" : "来生还盼续前缘",
     "action" : "$N使一式"+HIC"『来生还盼续前缘』"NOR+"，蓦地疾退一步，又冲前三步，手中"
                "$w化为光弧往$n的$l刺去",
     "dodge"  : 40,
     "force"  : 260,
     "damage" : 50,
     "lvl"    : 110,
     "damage_type":  "刺伤"]),
   (["skill_name" : "此情不移坚似钢",
     "action" : "$N使一式"+HIC"『此情不移坚似钢』"NOR+"，纵身跃起，不见踪影，接着却又从"
                "半空中穿下，双手握着$w，声势逼人地刺向$n的$l",
     "dodge"  : 60,
     "force"  : 280,
     "damage" : 65,
     "lvl"    : 120,
     "damage_type":  "刺伤"]),
   (["skill_name" : "质问天公不开眼",
     "action" : "$N使一式"+HIC"『质问天公不开眼』"NOR+"，手中$w“嗤”的一声斜刺向天空，"
                "随即向下“唰唰”两下，划出一个叉字，往$n的$l刺去",
     "dodge"  : 45,
     "force"  : 300,
     "damage" : 60,
     "lvl"    : 130,
     "damage_type":  "刺伤"]),
   (["skill_name" : "痴痴伤怀动情时",
     "action" : "$N使一式"+HIC"『痴痴伤怀动情时』"NOR+"，左腿微抬，手中$w自下方挑起，"
                "激起一股劲风反挑$n的$l",
     "dodge"  : 50,
     "force"  : 310,
     "damage" : 70,
     "lvl"    : 140,
     "damage_type":  "刺伤"]),
   (["skill_name" : "但舞痴心情长剑",
     "action" : "$N倾尽全力舞出"+HIC"『但舞痴心情长剑』"NOR+"，神色十分激动，眼中泪珠"
                "滚动，手中$w疾舞不停，全身都已笼罩在迫人的剑气中，$n不由骇然，只见$N"
                "身形微变，无数道剑气已逼向$n的$l",
     "dodge"  : 70,
     "damage" : 80,
     "force"  : 320,
     "lvl"    : 150,
     "damage_type":  "刺伤"])
});

int valid_enable(string usage){return usage=="sword" || usage=="parry";}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 900)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习痴心情长剑。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("chixin-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的痴心情长剑。\n");

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
    level   = (int) me->query_skill("chixin-jian",1);
    for(i = sizeof(action); i > 0; i--)
        if(level > action[i-1]["lvl"])
            return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    object weapon;

    if (!objectp(weapon = me->query_temp("weapon"))
    || (string)weapon->query("skill_type") != "sword")
        return notify_fail("你使用的武器不对。\n");

    if( (int)me->query("qi") < 50)
        return notify_fail("你的体力目前没有办法练习痴心情长剑。\n");

    if( (int)me->query("neili") < 60)
        return notify_fail("你的内力不够，无法练习痴心情长剑。\n");
        
    me->receive_damage("qi", 40);
    me->add("neili", -55);
    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"chixin-jian/" + action;
}
