// bagua-dao.c 八卦刀

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N脚踏八卦方位，盘身驻地，一招「削耳撩腮」，手中$w由上至下向$n砍去",
        "force"  : 125,
        "attack" : 15,
        "dodge"  : 56,
        "parry"  : 52,
        "lvl"    : 0,
        "damage" : 19,
        "skill_name" : "削耳撩腮",
        "damage_type" : "割伤",
]),
([      "action" : "$N使出「上步劈山」，身形向后乍然一闪，左手急速缠住$n左手，手中$w已罩向$n的$l",
        "force"  : 153,
        "attack" : 32,
        "dodge"  : 70,
        "parry"  : 75,
        "lvl"    : 20,
        "damage" : 27,
        "skill_name" : "上步劈山",
        "damage_type" : "割伤",
]),
([      "action" : "$N脚踏八卦方位，反转刀尖，一招「反身劈山」，手中$w竟然用刀背劈向$n的胸前",
        "force"  : 198,
        "attack" : 45,
        "dodge"  : 67,
        "parry"  : 87,
        "lvl"    : 40,
        "damage" : 34,
        "skill_name" : "反身劈山",
        "damage_type" : "割伤",
]),
([      "action" : "$N脚下踏着先天八卦的图式，身随意转，手随心动，一式「铁牛耕地」，$w缓缓的斜着向$n推去",
        "force"  : 220,
        "attack" : 48,
        "dodge"  : 75,
        "parry"  : 91,
        "lvl"    : 60,
        "damage" : 49,
        "skill_name" : "铁牛耕地",
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「朝阳刀」，左右腿虚点，$w一提一收，划出一个大平十字，挥向$n的颈部",
        "force"  : 231,
        "attack" : 55,
        "dodge"  : 73,
        "parry"  : 96,
        "lvl"    : 80,
        "damage" : 58,
        "skill_name" : "朝阳刀",
        "damage_type" : "割伤",
]),
([      "action" : "$N一提气，劲贯刀锋，$w“嗡嗡”做响，一招「上歪门」，自上而下直插$n的头顶",
        "force"  : 257,
        "attack" : 59,
        "dodge"  : 73,
        "parry"  : 95,
        "lvl"    : 100,
        "damage" : 66,
        "skill_name" : "上歪门",
        "damage_type" : "割伤",
]),
([      "action" : "$N使出「下歪门」，左手后撤，刀斜上招架，顺势下剁，刀光不停指向$n的$l",
        "force"  : 253,
        "attack" : 60,
        "dodge"  : 85,
        "parry"  : 105,
        "lvl"    : 120,
        "damage" : 63,
        "skill_name" : "下歪门",
        "damage_type" : "割伤",
]),
([      "action" : "$N使出「回身劈山」，身法陡变，轻灵飘忽，乘$n眼花耳鸣之际，突然右手刀光反卷向$n的$l",
        "force"  : 283,
        "attack" : 63,
        "dodge"  : 87,
        "parry"  : 118,
        "lvl"    : 140,
        "damage" : 69,
        "skill_name" : "回身劈山",
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「上势抱刀」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force"  : 268,
        "attack" : 66,
        "dodge"  : 88,
        "parry"  : 124,
        "lvl"    : 160,
        "damage" : 73,
        "skill_name" : "上势抱刀",
        "damage_type" : "割伤",
]),
([      "action" : "$N藏刀内收，一招「下势撩刀」，刀锋自下而上划了个半弧，向$n的$l挥去！\n"
                   "$n只觉眼前一片流光般的刀影，向自己全身涌去，退后欲避，又觉一阵寒气直逼过来",
        "force"  : 272,
        "attack" : 67,
        "dodge"  : 94,
        "parry"  : 133,
        "lvl"    : 180,
        "damage" : 82,
        "skill_name" : "下势撩刀",
        "damage_type" : "割伤",
]),
([      "action" : "$N蓦的使一招「八卦八阵」，顿时剑光中无数朵刀花从四面八方涌向$n全身",
        "force"  : 280,
        "attack" : 72,
        "dodge"  : 96,
        "parry"  : 132,
        "lvl"    : 200,
        "damage" : 85,
        "skill_name" : "八卦八阵",
        "damage_type" : "割伤",
]),
});

int valid_enable(string usage)
{
        return usage == "blade" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为尚浅，无法练习八卦刀法。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < 100 )
                return notify_fail("你的基本刀法水平有限，无法练习八卦刀法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("bagua-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的八卦刀法。\n");

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
        int i, level, tiandao;

        level = (int)me->query_skill("bagua-dao", 1);
        tiandao = me->query_temp("pfm_tiandao");

        switch (tiandao)
        {
        case 1:
                return ([ "action": WHT "$N" WHT "施出「" HIY "天刀八势" NOR +
                                    WHT "」起手势" HIY "『乾』" NOR + WHT "字"
                                    "诀，手中的$w" WHT "宛如一道闪电对准$n" WHT
                                    "直劈而下",
                           "force"  : 180,
                           "damage" : 85,
                           "attack" : 65,
                           "dodge"  : 96,
                           "parry"  : 132,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 2:
                return ([ "action": WHT "$N" WHT "身形一转，一招" HIY "『坤』"
                                    NOR + WHT "字诀随手施出，手中$w" WHT "顿时"
                                    "幻作一道道刀芒笼罩$n" WHT "全身",
                           "force"  : 220,
                           "damage" : 87,
                           "attack" : 63,
                           "dodge"  : 96,
                           "parry"  : 112,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 3:
                return ([ "action": WHT "$N" WHT "深深吸入一口气，施一招" HIY
                                    "『巽』" NOR + WHT "字诀施出，手中$w" WHT
                                    "顺势翻手一刀，向$n" WHT "劈斩出",
                           "force"  : 230,
                           "damage" : 83,
                           "attack" : 61,
                           "dodge"  : 93,
                           "parry"  : 107,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 4:
                return ([ "action": WHT "$N" WHT "身法陡然加快，手中$w" WHT "随"
                                    "着" HIY "『震』" NOR + WHT "字诀方位斩出，"
                                    "数道刀芒直劈向$n" WHT "要害所在",
                           "force"  : 220,
                           "damage" : 87,
                           "attack" : 63,
                           "dodge"  : 96,
                           "parry"  : 112,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 5:
                return ([ "action": WHT "接着$N" WHT "一声长叹，依照八卦方位施"
                                    "出" HIY "『坎』" NOR + WHT "字诀，$w" WHT
                                    "刀身顿时迸出道金光射向$n" WHT,
                           "force"  : 223,
                           "damage" : 81,
                           "attack" : 67,
                           "dodge"  : 99,
                           "parry"  : 103,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 6:
                return ([ "action": WHT "$N" WHT "飞身一跃而起，凌空施一式" HIY
                                    "『兑』" NOR + WHT "字诀，顿时刀光烁烁犹如"
                                    "千万柄$w" WHT "齐罩向$n" WHT,
                           "force"  : 210,
                           "damage" : 85,
                           "attack" : 65,
                           "dodge"  : 96,
                           "parry"  : 132,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 7:
                return ([ "action": WHT "$N" WHT "紧接着施展出" HIY "『离』" NOR +
                                    WHT "字诀，$w" WHT "犹如九天神雷，携着呼啸"
                                    "破空之声直贯向$n" WHT "而去",
                           "force"  : 253,
                           "damage" : 63,
                           "attack" : 52,
                           "dodge"  : 97,
                           "parry"  : 88,
                           "damage_type" : "割伤",
                        ]);
                break;
        case 8:
                return ([ "action": WHT "最后$N" WHT "一声冷笑，施出「" HIY "天"
                                    "刀八势" WHT "」最终" HIY "『艮』" NOR + WHT
                                    "字诀，只见$w" WHT "一闪，已至$n" WHT "眼前",
                           "force"  : 197,
                           "damage" : 89,
                           "attack" : 58,
                           "dodge"  : 103,
                           "parry"  : 142,
                           "damage_type" : "割伤",
                        ]);
                break;
        default:
                for(i = sizeof(action); i > 0; i--)
                        if(level > action[i-1]["lvl"])
                                return action[NewRandom(i, 20, level / 5)];
                break;
        }
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够，练不了八卦刀法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够，练不了八卦刀法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -70);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"bagua-dao/" + action;
}
