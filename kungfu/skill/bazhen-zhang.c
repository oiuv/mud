#include <ansi.h>

inherit SKILL;

mapping *action=({
([      "action" : "$N一招" HIY "『天阵居乾为天门』" NOR "身体缓缓游动，围绕$n轻拍数掌，忽然"
                   "迅速向上斜劈，掌力化成弧形，罩向$n的$l",
        "force" : 130,
        "attack": 21,
        "dodge" : 70,
        "parry" : 65,
        "damage": 14,
        "lvl"   : 0,
        "skill_name" : "天阵居乾为天门",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招" WHT "『地阵居坤为地门』" NOR "脚迈连环步，双掌不停的滑动，忽然爆"
                   "喝一声，身体高高跃起，扑向$n的$l就是一记重掌",
        "force" : 170,
        "attack": 25,
        "dodge" : 83,
        "parry" : 76,
        "damage": 17,
        "lvl"   : 30,
        "skill_name" : "地阵居坤为地门",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招" YEL "『风阵居巽为风门』" NOR "身如行云流水，飘忽不定，双手云袖飘"
                   "动，忽然袖中双掌咋现，分别从左右两边齐齐攻向$n",
        "force" : 190,
        "attack": 28,
        "dodge" : 95,
        "parry" : 88,
        "damage": 20,
        "lvl"   : 60,
        "skill_name" : "风阵居巽为风门",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招" HIW "『云阵居震为云门』" NOR "倏忽欺至$n身前，含胸收腹，头缓缓低"
                   "下，似乎显得没精打采，一记云掌软绵绵的拍向$n",
        "force" : 230,
        "attack": 35,
        "dodge" : 107,
        "parry" : 98,
        "damage": 23,
        "lvl"   : 90,
        "skill_name" : "云阵居震为云门",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招" HIR "『飞龙居坎飞龙门』" NOR "突然纵起丈余，头下脚上，倒过身子，"
                   "犹如一只在空中盘旋的飞龙，一掌拍向$n",
        "force" : 270,
        "attack": 40,
        "dodge" : 129,
        "parry" : 113,
        "damage": 27,
        "lvl"   : 120,
        "skill_name" : "飞龙居坎飞龙门",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招" MAG "『武翼居兑武翼门』" NOR "身如陀螺急转，展开轻功围着$n快速游"
                   "走，忽然飞身而起，一掌拍向$n的$l",
        "force" : 320,
        "attack": 48,
        "dodge" : 154,
        "parry" : 118,
        "damage": 38,
        "lvl"   : 150,
        "skill_name" : "武翼居兑武翼门",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N错步上前，一招" CYN "『鸟翔居离鸟翔门』" NOR "招招抢先，以快打慢，犹如"
                   "一只展翅翱翔的大鹏，轻轻一跃已经到了$n的身后，运掌如风推\n向$n的大椎穴",
        "force" : 360,
        "attack": 61,
        "dodge" : 153,
        "parry" : 131,
        "damage": 45,
        "lvl"   : 180,
        "skill_name" : "鸟翔居离鸟翔门",
        "damage_type" : "内伤"
]),
([      "action" : "$N身形一扭，将背门对准$n，使出一招" HIM "『蜿盘居艮蜿盘门』" NOR "无论$n"
                   "如何出招，$N的背后好像生了眼睛，总能及时闪避，忽\n然$N背脊猛向$n胸口靠去，"
                   "双掌突然从腋下钻出，直击$n的$l",
        "force" : 380,
        "attack": 73,
        "dodge" : 155,
        "parry" : 135,
        "damage": 57,
        "lvl"   : 220,
        "skill_name" : "蜿盘居艮蜿盘门",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage)
{
        return usage == "strike" || usage == "parry";
}

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练八阵八卦掌必须空手。\n");

        if (me->query("max_neili") < 1200)
                return notify_fail("你的内力不够，无法练习八阵八卦掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("bazhen-zhang", 1))
                return notify_fail("你的基本掌法火候有限，无法领会更高深的八阵八卦掌。\n");

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
        level = (int)me->query_skill("bazhen-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 85);
        me->add("neili", -60);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"bazhen-zhang/" + action;
}
