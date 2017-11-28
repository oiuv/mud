#include <ansi.h>
inherit SKILL;

mapping *action = ({
([  "action": "$N全身拔地而起，半空中一个筋斗，一式「凶鹰袭兔」，迅猛地抓向$n的$l",
    "force" : 250,
    "attack": 45,
    "dodge" : 10,
    "parry" : 18,
    "damage": 30,
    "lvl"   : 0,
    "skill_name" : "凶鹰袭兔" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N单腿直立，双臂平伸，一式「雄鹰展翅」，双爪一前一后拢向$n的$l",
    "force" : 270,
    "attack": 50,
    "dodge" : 20,
    "parry" : 26,
    "damage": 45,
    "lvl"   : 40,
    "skill_name" : "雄鹰展翅" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N一式「拔翅鹰飞」，全身向斜里平飞，右腿一绷，双爪搭向$n的肩头",
    "force" : 300,
    "attack": 60,
    "dodge" : 20,
    "parry" : 32,
    "damage": 45,
    "lvl"   : 70,
    "skill_name"  : "拔翅鹰飞" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N双爪交错上举，使一式「迎风振翼」，一拔身，分别袭向$n左右腋空门",
    "force" : 340,
    "attack": 85,
    "dodge" : 30,
    "parry" : 55,
    "damage": 55,
    "lvl"   : 100,
    "skill_name" : "迎风振翼" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N全身滚动上前，一式「飞龙献爪」，右爪突出，鬼魅般抓向$n的胸口",
    "force" : 350,
    "attack": 110,
    "dodge" : 40,
    "parry" : 68,
    "damage": 76,
    "lvl"   : 120,
    "skill_name" : "飞龙献爪" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N伏地滑行，一式「顶天立地」，上手袭向膻中大穴，下手反抓$n的裆部",
    "force" : 370,
    "attack": 121,
    "dodge" : 51,
    "parry" : 78,
    "damage": 96,
    "lvl"   : 140,
    "skill_name" : "顶天立地" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N左右手掌爪互逆，一式「搏击长空」，无数道劲气破空而出，迅疾无比地击向$n",
    "force" : 398,
    "attack": 133,
    "dodge" : 67,
    "parry" : 85,
    "damage": 107,
    "lvl"   : 160,
    "skill_name" : "搏击长空" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N腾空高飞三丈，一式「鹰扬万里」，天空中顿时显出一个巨灵爪影，缓缓罩向$n",
    "force" : 410,
    "attack": 143,
    "dodge" : 55,
    "parry" : 81,
    "damage": 121,
    "lvl"   : 180,
    "skill_name" : "鹰扬万里" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N忽的拨地而起，使一式「苍龙出水」，身形化作一道闪电射向$n",
    "force" : 431,
    "attack": 162,
    "dodge" : 63,
    "parry" : 86,
    "damage": 133,
    "lvl"   : 200,
    "skill_name" : "苍龙出水" ,
    "damage_type" : "内伤"
]),
([  "action":  "$N微微一笑，使一式「万佛朝宗」，双手幻出万道金光,直射向$n的$l",
    "force" : 455,
    "attack": 173,
    "dodge" : 66,
    "parry" : 95,
    "damage": 137,
    "lvl"   : 220,
    "skill_name" : "万佛朝宗" ,
    "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage == "claw" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
            return notify_fail("练凝血神爪必须空手。\n");

        if ((int)me->query("max_neili") < 800)
            return notify_fail("你的内力太弱，无法练凝血神爪。\n");

        if ((int)me->query_str() < 40)
            return notify_fail("你现在膂力孱弱，还无法练凝血神爪。\n");

        if ((int)me->query_dex() < 40)
            return notify_fail("你现在身法欠佳，还无法练凝血神爪。\n");

        if ((int)me->query_skill("force") < 200)
            return notify_fail("你的内功太差，无法练凝血神爪。\n");

        if ((int)me->query_skill("claw", 1) < 180)
            return notify_fail("你的基本爪法太差，无法领会凝血神爪。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("ningxue-shenzhao", 1))
            return notify_fail("你的基本爪法火候不够，无法领会更高深的凝血神爪。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action); i > 0; i--)
                if (level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("ningxue-shenzhao",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 5, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 120)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 350)
                return notify_fail("你的内力不够练凝血神爪。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -300);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("ningxue-shenzhao", 1);
        flvl = me->query("jiali");
        if (lvl < 80 || flvl < 10 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("ningxue_shenzhao",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 100 + random(lvl / 10) ])))
        {
                return HIR "只听$n" HIR "一声惨嚎，看来受到了凝血神爪毒劲的干扰！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"ningxue-shenzhao/" + action;
}
