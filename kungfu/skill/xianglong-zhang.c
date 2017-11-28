#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N双掌平平提到胸前，神色沉重的缓缓施出「亢龙有悔」推向$n",
        "force"  : 640,
        "attack" : 220,
        "dodge"  : 10,
        "parry"  : 100,
        "damage" : 130,
        "damage_type": "震伤"
]),
([      "action" : "$N突然身形飞起，双掌居高临下一招「飞龙在天」拍向$n的$l",     
        "force"  : 580,
        "attack" : 200,
        "dodge"  : 5,
        "parry"  : 80,
        "damage" : 100,
        "damage_type": "震伤"
]),
([      "action" : "$N右掌一招「见龙在田」，迅捷无比地劈向$n的$l",
        "force"  : 520,
        "attack" : 150,
        "dodge"  : 40,
        "parry"  : 145,
        "damage" : 100,
        "damage_type": "震伤"
]),
([      "action" : "$N双掌施出一招「鸿渐于陆」，隐隐带着风声拍向$n的$l",
        "force"  : 560,
        "attack" : 180,
        "dodge"  : 15,
        "parry"  : 130,
        "damage" : 110,
        "damage_type": "震伤"
]),
([      "action" : "$N左掌聚成拳状，右掌一招「潜龙勿用」缓缓推向$n的$l",
        "force"  : 580,
        "attack" : 190,
        "dodge"  : 10,
        "parry"  : 130,
        "damage" : 90,
        "damage_type": "震伤"
]),
([      "action" : "$N施出一招「利涉大川」，右掌插腰，左掌劈向$n的$l",
        "force"  : 550,
        "attack" : 150,
        "dodge"  : 20,
        "parry"  : 180,
        "damage" : 110,
        "damage_type": "震伤"
]),
([      "action" : "$N使出「突如其来」，右掌从不可能的角度向$n的$l推出",
        "force"  : 520,
        "attack" : 160,
        "dodge"  : 40,
        "parry"  : 150,
        "damage" : 90,
        "damage_type": "震伤"
]),
([      "action" : "$N大吼一声，双掌使出「震惊百里」，不顾一切般击向$n",
        "force"  : 690,
        "attack" : 220,
        "dodge"  : -10,
        "parry"  : 75,
        "damage" : 120,
        "damage_type": "震伤"
]),
([      "action" : "$N使出降龙十八掌之「或跃在渊」，向$n的$l连续拍出数掌",
        "force"  : 530,
        "attack" : 150,
        "dodge"  : 30,
        "parry"  : 140,
        "damage" : 140,
        "damage_type": "震伤"
]),
([      "action" : "$N身形滑动，双掌使一招「双龙取水」一前一后按向$n的$l",
        "force"  : 560,
        "attack" : 170,
        "dodge"  : 50,
        "parry"  : 115,
        "damage" : 100,
        "damage_type": "震伤"
]),
([      "action" : "$N使出「鱼跃于渊」，身形飞起，双掌并在一起向$n的$l劈下",     
        "force"  : 550,
        "attack" : 185,
        "dodge"  : 30,
        "parry"  : 100,
        "damage" : 110,
        "damage_type": "震伤"
]),
([      "action" : "$N双掌立起，使出降龙十八掌中的「时乘六龙」向$n连砍六下",
        "force"  : 570,
        "attack" : 180,
        "dodge"  : 50,
        "parry"  : 110,
        "damage" : 110,
        "damage_type": "震伤"
]),
([      "action" : "$N使出「密云不雨」，左掌封住$n的退路，右掌斜斜地劈向$l",     
        "force"  : 560,
        "attack" : 170,
        "dodge"  : 15,
        "parry"  : 120,
        "damage" : 100,
        "damage_type": "震伤"
]),
([      "action" : "$N使出降龙十八掌一势「损则有孚」，双掌软绵绵地拍向$n的$l",
        "force"  : 590,
        "attack" : 175,
        "dodge"  : 15,
        "parry"  : 100,
        "damage" : 80,
        "damage_type": "震伤"
]),
([      "action" : "$N脚下一转，突然欺到$n身前，一招「龙战于野」拍向$n的$l",     
        "force"  : 580,
        "attack" : 180,
        "dodge"  : 10,
        "parry"  : 95,
        "damage" : 110,
        "damage_type": "震伤"
]),
([      "action" : "却见$N门户大开，蓦地施出一招「履霜冰至」向$n的$l劈去",
        "force"  : 660,
        "attack" : 200,
        "dodge"  : -20,
        "parry"  : 90,
        "damage" : 100,
        "damage_type": "震伤"
]),
([      "action" : "$N嗔目大喝，使出「羝羊触蕃」，双掌由下往上击向$n的$l",
        "force"  : 520,
        "attack" : 160,
        "dodge"  : 40,
        "parry"  : 130,
        "damage" : 110,
        "damage_type": "震伤"
]),
([      "action" : "$N左掌护胸，右掌使一招「神龙摆尾」上下晃动着击向$n的$l",     
        "force"  : 520,
        "attack" : 150,
        "dodge"  : 60,
        "parry"  : 120,
        "damage" : 80,
        "damage_type": "震伤"
]),
});

string main_skill() { return "xianglong-zhang"; }

mapping sub_skills = ([
        "kanglong-youhui"  : 150,        // 1
        "feilong-zaitian"  : 150,        // 2
        "jianlong-zaitian" : 150,        // 3
        "hongjian-yulu"    : 150,        // 4
        "qianlong-wuyong"  : 150,        // 5
        "lishe-dachuan"    : 150,        // 6
        "turu-qilai"       : 150,        // 7
        "zhenjing-baili"   : 150,        // 8
        "huoyue-zaiyuan"   : 150,        // 9
        "shuanglong-qushui": 150,        // 10
        "yuyue-yuyuan"     : 150,        // 11
        "shicheng-liulong" : 150,        // 12
        "miyun-buyu"       : 150,        // 13
        "sunze-youfu"      : 150,        // 14
        "longzhan-yuye"    : 150,        // 15
        "lvshuang-bingzhi" : 150,        // 16
        "diyang-chufan"    : 150,        // 17
        "shenlong-baiwei"  : 150,        // 18
]);

int get_ready(object me)
{
        return 1;
}

int get_finish(object me)
{
        if (me->query("character") == "阴险奸诈")
        {
                tell_object(me, "你演练完毕，发现此套掌法似乎跟自己的性格"
                                "不合，难于修炼。\n");
                return 0;
        }

        if (me->query("gender") == "无性")
        {
                tell_object(me, "你演练完毕，只觉体内真气阴阳不调，运功之"
                                "下几欲昏厥。\n");
                return 0;
        }

        if (me->query("str") < 36)
        {
                tell_object(me, "你演练完毕，只觉手臂又酸又软，痛得几乎抬"
                                "不起来。\n");
                return 0;
        }

        if (me->query("con") < 32)
        {
                tell_object(me, "你演练完毕，就觉得眼前金星乱冒，太阳穴突"
                                "突的跳。\n");
                return 0;
        }

        if ((int)me->query_skill("force") < 300)
        {
                tell_object(me, "你演练完毕，几乎虚脱，看来自身内功水平还"
                                "有待提高。\n");
                return 0;
        }

        if ((int)me->query("max_neili") < 3000)
        {
                tell_object(me, "你演练完毕，丹田提不起半点力来，看来应该"
                                "继续锻炼内力。\n");
                return 0;
        }

        if (random(30) <= 28)
        {
                tell_object(me, "你对十八掌的奥妙颇有领悟，或许再演练几次"
                                "就能融会贯通。\n");
                return 0;
        }

        tell_object(me, HIY "你一气呵成，将十八掌从头到尾演练了一变，心中"
                        "顿悟，通\n晓了降龙十八掌的奥妙精髓，融会贯通了掌"
                        "法的精微之处，\n再也非拆开使用那么那么简单。\n" NOR);
        return 1;
}

mapping query_sub_skills()
{
        return sub_skills;
}

int valid_enable(string usage)
{
        return usage == "strike" || usage == "parry";
}  

int valid_learn(object me)
{
        if (me->query("character") == "阴险奸诈")
                return notify_fail("你心中暗想：这武功难练得紧，学它做甚？\n");

        if ((int)me->query("str") < 36)
                return notify_fail("你的先天膂力孱弱，难以修炼降龙十八掌。\n");

        if ((int)me->query("con") < 32)
                return notify_fail("你的先天根骨孱弱，难以修炼降龙十八掌。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候不够，难以修炼降龙十八掌。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不足，难以修炼降龙十八掌。\n");

        if ((int)me->query_skill("strike", 1) < 180)
                return notify_fail("你的基本掌法火候不够，难以修炼降龙十八掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("xianglong-zhang", 1))
                return notify_fail("你的基本掌法水平有限，难以领会更高深的降龙十八掌。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        int cost;

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练降龙十八掌必须空手。\n");

        if ((int)me->query("qi") < 150)
                return notify_fail("你的体力太低了。\n");

        cost = me->query_skill("xianglong-zhang", 1) / 5 + 90;

        if ((int)me->query("neili") < cost)
                return notify_fail("你的内力不够练降龙十八掌。\n");

        me->receive_damage("qi", 120);
        me->add("neili", -cost);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;

        lvl = me->query_skill("xianglong-zhang", 1);

        if (damage_bonus < 150 || lvl < 150) return 0;

        if (damage_bonus / 6 > victim->query_con())
        {
                victim->receive_wound("qi", (damage_bonus - 80) / 3, me);

                return random(2) ? HIR "只听$n" HIR "前胸「咔嚓」一声脆响，竟像是"
                                   "肋骨断折的声音。\n" NOR:

                                   HIR "$n" HIR "一声惨叫，胸前「咔嚓咔嚓」几声脆"
                                   "响，口中鲜血狂喷。\n" NOR;
        }
}

void skill_improved(object me)
{
        int i;
        string *sub_skillnames;

        sub_skillnames = keys(sub_skills);
        for (i = 0; i < sizeof(sub_skillnames); i++)
                me->delete_skill(sub_skillnames[i]);
}

string perform_action_file(string action)
{
        return __DIR__"xianglong-zhang/" + action;
}
