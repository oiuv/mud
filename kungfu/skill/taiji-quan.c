// taiji-quan.c 太极拳

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「揽雀尾」，双手划了个半圈，按向$n的$l",
        "force" : 20,
        "dodge" : 50,
        "parry" : 38,
        "skill_name" : "揽雀尾",
        "lvl" : 0,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一招「单鞭」，右手收置肋下，左手向外挥出，劈向$n的$l",
        "force" : 25,
        "dodge" : 48,
        "parry" : 57,
        "skill_name" : "单鞭",
        "lvl" : 5,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手回收，右手由钩变掌，由右向左，使一招「提手上式」，向$n的$l打去",
        "force" : 25,
        "dodge" : 46,
        "parry" : 49,
        "skill_name" : "提手上式",
        "lvl" : 10,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手划弧，右手向上，左手向下，使一招「白鹤亮翅」，分击$n的面门和$l",
        "force" : 25,
        "dodge" : 44,
        "parry" : 71,
        "skill_name" : "白鹤亮翅",
        "lvl" : 15,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手由胸前向下，身体微转，划了一个大圈，使一招「搂膝拗步」，击向$n的$l",
        "force" : 25,
        "dodge" : 44,
        "parry" : 58,
        "skill_name" : "搂膝拗步",
        "lvl" : 20,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手由下上挑，右手内合，使一招「手挥琵琶」，向$n的$l打去",
        "force" : 30,
        "dodge" : 48,
        "parry" : 62,
        "skill_name" : "手挥琵琶",
        "lvl" : 25,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手变掌横于胸前，右拳由肘下穿出，一招「肘底看锤」，锤向$n的$l",
        "force" : 30,
        "dodge" : 54,
        "parry" : 71,
        "skill_name" : "肘底看锤",
        "lvl" : 30,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左脚前踏半步，右手使一招「海底针」，指由下向$n的$l戳去",
        "force" : 30,
        "dodge" : 76,
        "parry" : 65,
        "skill_name" : "海底针",
        "lvl" : 35,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N招「闪通臂」，左脚一个弓箭步，右手上举向外撇出，向$n的$l挥去",
        "force" : 30,
        "dodge" : 79,
        "parry" : 76,
        "skill_name" : "闪通臂",
        "lvl" : 40,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N两手由相对，转而向左上右下分别挥出，右手使一招「斜飞式」，挥向$n的$l",
        "force" : 35,
        "dodge" : 82,
        "parry" : 52,
        "skill_name" : "斜飞式",
        "lvl" : 45,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手虚按，右手使一招「白蛇吐信」，向$n的$l插去",
        "force" : 35,
        "dodge" : 70,
        "parry" : 82,
        "skill_name" : "白蛇吐信",
        "lvl" : 50,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手握拳，向前向后划弧，一招「双峰贯耳」打向$n的$l",
        "force" : 35,
        "dodge" : 88,
        "parry" : 51,
        "skill_name" : "双风贯耳",
        "lvl" : 55,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手虚划，右手一记「指裆锤」击向$n的裆部",
        "force" : 40,
        "dodge" : 86,
        "parry" : 71,
        "skill_name" : "指裆锤",
        "lvl" : 60,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N施出「伏虎式」，右手击向$n的$l，左手攻向$n的裆部",
        "force" : 40,
        "dodge" : 84,
        "parry" : 81,
        "skill_name" : "伏虎式",
        "lvl" : 65,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N由臂带手，在面前缓缓划过，使一招「云手」，挥向$n的$l",
        "force" : 45,
        "dodge" : 82,
        "parry" : 87,
        "skill_name" : "云手",
        "lvl" : 70,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左腿收起，右手使一招「金鸡独立」，向$n的$l击去",
        "force" : 50,
        "dodge" : 90,
        "parry" : 51,
        "skill_name" : "金鸡独立",
        "lvl" : 75,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N右手由钩变掌，双手掌心向上，右掌向前推出一招「高探马」",
        "force" : 55,
        "dodge" : 68,
        "parry" : 90,
        "skill_name" : "高探马",
        "lvl" : 80,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N右手使一式招「玉女穿梭」，扑身向$n的$l插去",
        "force" : 60,
        "dodge" : 76,
        "parry" : 92,
        "skill_name" : "玉女穿梭",
        "lvl" : 85,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N右手经腹前经左肋向前撇出，使一招「反身撇锤」，向$n的$l锤去",
        "force" : 65,
        "dodge" : 84,
        "parry" : 95,
        "skill_name" : "反身撇锤",
        "lvl" : 90,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手虚按，右腿使一招「转身蹬腿」，向$n的$l踢去",
        "force" : 70,
        "dodge" : 42,
        "parry" : 99,
        "skill_name" : "反身蹬腿",
        "lvl" : 100,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手向上划弧拦出，右手使一招「搬拦锤」，向$n的$l锤去",
        "force" : 75,
        "dodge" : 81,
        "parry" : 102,
        "skill_name" : "白蛇吐信",
        "lvl" : 120,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一招「栽锤」，左手搂左膝，右手向下锤向$n的$l",
        "force" : 80,
        "dodge" : 88,
        "parry" : 115,
        "skill_name" : "栽锤",
        "lvl" : 140,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手先抱成球状，忽地分开右手上左手下，一招「野马分鬃」，向$n的$l和面门打去",
        "force" : 85,
        "dodge" : 86,
        "parry" : 119,
        "skill_name" : "野马分鬃",
        "lvl" : 160,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手由胸前向下，右臂微曲，使一招「抱虎归山」，向$n的$l推去",
        "force" : 90,
        "dodge" : 94,
        "parry" : 115,
        "skill_name" : "抱虎归山",
        "lvl" : 180,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手经下腹划弧交于胸前，成十字状，一式「十字手」，向$n的$l打去",
        "force" : 95,
        "dodge" : 102,
        "parry" : 122,
        "skill_name" : "十字手",
        "lvl" : 200,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左脚踏一个虚步，双手交叉成十字拳，一招「进步七星」，向$n的$l锤去",
        "force" : 100,
        "dodge" : 110,
        "parry" : 133,
        "skill_name" : "进步七星",
        "lvl" : 210,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身体向后腾出，左手略直，右臂微曲，使一招「倒撵猴」，向$n的$l和面门打去",
        "force" : 115,
        "dodge" : 132,
        "parry" : 121,
        "skill_name" : "倒撵猴",
        "lvl" : 220,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手伸开，以腰为轴，整个上身划出一个大圆弧，\n一招「转身摆莲」，将$n浑身上下都笼罩在重重掌影之中",
        "force" : 120,
        "dodge" : 154,
        "parry" : 145,
        "skill_name" : "转身摆莲",
        "lvl" : 230,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手握拳，右手缓缓收至耳际，左手缓缓向前推出，\n拳意如箭，一招「弯弓射虎」，直奔$n心窝而去",
        "force" : 115,
        "dodge" : 166,
        "parry" : 175,
        "skill_name" : "弯弓射虎",
        "lvl" : 240,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手在胸前翻掌，由腹部向前向上推出，一招「如封似闭」，一股劲风直逼$n",
        "force" : 120,
        "dodge" : 178,
        "parry" : 185,
        "skill_name" : "如封似闭",
        "lvl" : 250,
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "unarmed" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "wudang-zhang" || combo == "paiyun-shou";
}

int valid_learn(object me)
{
        if ((int)me->query("int") < 26)
                return notify_fail("你先天悟性太差，难以领会太极拳的要诣。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练太极拳必须空手。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不够，无法学太极拳。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力太弱，无法练太极拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 100)
                return notify_fail("你的基本拳脚火候不够，无法学太极拳。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("taiji-quan", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的太极拳。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("taiji-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("taiji-quan", 1) < 100 ||
            ! living(me) || me->query_temp("weapon"))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force") + mp;
        dp = me->query_skill("parry", 1) / 2 +
             me->query_skill("taiji-quan", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(3))
                {
                case 0:
                        result += (["msg" : HIC "$n" HIC "面含微笑，双手齐出，划出了"
                                            "一个圆圈，竟然让$N" +
                                            HIC "的攻击全不着力。\n" NOR]);
                        break;

                case 1:
                        result += (["msg" : HIC "$n" HIC "左右格档，使出四两拨千斤的手法，"
                                            "化解$N" HIC "的攻势于无形。\n" NOR]);
                        break;

                default:
                        result += (["msg" : HIC "$n" HIC "慢慢出拳"
                                            HIC "，动作虽然缓慢，却让$N"
                                            HIC "感到浑身粘滞，甚不舒畅。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(3))
                {
                case 0:
                        result = HIY "$n" HIY "面含微笑，双手齐出，划出了"
                                 "一个圆圈，然而$N" +
                                 HIY "理也不理，随手挥招直入，进袭$n"
                                 HIY "！\n" NOR;
                        break;

                case 1:
                        result = HIY "$n" HIY "左右格档，使出四两拨千斤的手法，"
                                 "可是$N" HIY "攻势却是变化无方，不遵循常理。\n" NOR;
                        break;

                default:
                        result = HIY "$n" HIY "慢慢出拳"
                                 HIY "，动作缓慢却让$N"
                                 HIY "感到粘滞，可是$N"
                                 HIY "立刻变化节奏，出奇招快速进击$n"
                                 HIY "！\n" NOR;
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

        lvl = me->query_skill("taiji-quan", 1);
        if (lvl < 80)  return 0;
        if (lvl < 200) return 50;
        if (lvl < 280) return 80;
        if (lvl < 350) return 100;
        return 120;
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练太极拳。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -59);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"taiji-quan/" + action;
}
