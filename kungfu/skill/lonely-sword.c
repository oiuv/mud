#include <ansi.h>

inherit SKILL;

string *parry_msg = ({
        "却见$n踏前一步，剑式斜指你的右臂，想要使$P闪身而退。\n",
        "$n以攻为守，以进为退，凝神运气向$P猛攻快打地挥出方位大异的泰山「" HIY "快活三" NOR "」三剑。\n",
        "$n剑法突变，剑势伸缩不定，奔腾矫夭，逆使嵩山剑法的「" HIC "天外玉龙" NOR "」企图迫使$P变招。\n",
        "$n突然一剑点向$P的$l，虽一剑却暗藏无数后着，$P手足无措，攻势不由自主停了下来！\n"
        "$n不闪不避，举剑闪电般使出「" HIC "叠翠浮青" NOR "」反削$P的$l，想挡过你此招。\n",
        "$n突然使出青城派松风剑法的「" HIG "鸿飞冥冥" NOR "」，可是方位却有所偏差，长剑对着$P一绞，企\n图突破$P的攻势！\n"
        "$n挺剑一招象是「" HIW "白云出岫" NOR "」回刺$P的$l，企图将$P的攻势化解。\n",
        "只见$n不退反进，身如飘风，诡异地一式「" HIW "天柱云气" NOR "」，动向无定不可捉摸地挡住了$P的\n进攻。\n",
        "$n不退反进，使出恒山剑招「" HIC "绵里藏针" NOR "」，森森剑气充溢四周！架开了$P的这招\n",
});

mapping *action = ({
([      "action" : "但见$N挺身而上，$w一旋，一招仿佛泰山剑法的「" HIC "来鹤清泉" NOR "」直刺$n的$l",
        "force" : 10,
        "attack": 62,
        "dodge" : 45,
        "parry" : 45,
        "damage": 10,
        "lvl" : 0,
        "damage_type" : "刺伤"
]),
([      "action" : "$N奇诡地向$n挥出「" CYN "泉鸣芙蓉" NOR "」、「" MAG "鹤翔紫盖" NOR "」、「" HIG
                   "石廪书声" NOR "」、「" HIW "天柱云气" NOR "」及「" HIY "雁回祝融" NOR "」衡\n"
                   "山五神剑",
        "force" : 10,
        "attack": 65,
        "dodge" : 50,
        "parry" : 45,
        "damage": 15,
        "lvl" : 7,
        "damage_type" : "刺伤"
]),
([
        "action" : "$N剑随身转，续而刺出十九剑，竟然是华山「" HIW "玉女十九剑" NOR "」，但奇的是这"
                   "十九剑便如一招，手法之快，\n"
                   "直是匪夷所思",
        "force" : 10,
        "attack": 60,
        "dodge" : 65,
        "parry" : 60,
        "damage": 20,
        "lvl" : 14,
        "damage_type" : "刺伤"
]),
([      "action" : "$N剑势忽缓而不疏，剑意有余而不尽，化恒山剑法为一剑，向$n慢慢推去",
        "force" : 20,
        "attack": 65,
        "dodge" : 65,
        "parry" : 60,
        "damage": 25,
        "lvl" : 21,
        "damage_type" : "刺伤"
]),
([      "action" : "$N剑意突焕气象森严，便似千军万马奔驰而来，长枪大戟，黄沙千里，尽括嵩山剑势击向$n",
        "force" : 20,
        "attack": 70,
        "dodge" : 60,
        "parry" : 65,
        "damage": 30,
        "lvl" : 28,
        "damage_type" : "刺伤"
]),
([      "action" : "却见$N身随剑走，左边一拐，右边一弯，剑招也是越转越加狠辣，竟化「" HIY "泰山十八"
                   "盘" NOR "」为一剑攻\n"
                   "向$n",
        "force" : 30,
        "attack": 73,
        "dodge" : 70,
        "parry" : 65,
        "damage": 30,
        "lvl" : 35,
        "damage_type" : "刺伤"
]),
([      "action" : "$N剑招突变，使出衡山的「" HIB "一剑落九雁" NOR "」，削向$n的$l，怎知剑到中途，"
                   "突然转向，大出$n\n"
                   "意料之外",
        "force" : 40,
        "attack": 75,
        "dodge" : 75,
        "parry" : 70,
        "damage": 40,
        "lvl" : 42,
        "damage_type" : "刺伤"
]),
([      "action" : "$N吐气开声，一招似是「" CYN "独劈华山" NOR "」，手中$w向下斩落，直劈向$n的$l",
        "force" : 50,
        "attack": 72,
        "dodge" : 80,
        "parry" : 70,
        "damage": 50,
        "lvl" : 49,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w越转越快，使的居然是衡山的「" HIW "百变千幻云雾十三式" NOR "」，剑式"
                   "有如云卷雾涌，旁观\n"
                   "者不由得目为之眩",
        "force" : 60,
        "attack": 71,
        "dodge" : 80,
        "parry" : 70,
        "damage": 60,
        "lvl" : 56,
        "damage_type" : "刺伤"
]),
([      "action" : "$N含笑抱剑，气势庄严，$w轻挥，尽融「" HIR "达摩剑" NOR "」为一式，闲舒地刺向$n",
        "force" : 70,
        "attack": 80,
        "dodge" : 90,
        "parry" : 65,
        "damage": 70,
        "lvl" : 63,
        "damage_type" : "刺伤"
]),
([      "action" : "$N举起$w运使「" CYN "太极剑" NOR "」剑意，划出大大小小无数个圆圈，无穷无尽源"
                   "源不绝地缠向$n",
        "force" : 80,
        "attack": 77,
        "dodge" : 90,
        "parry" : 70,
        "damage": 80,
        "lvl" : 70,
        "damage_type" : "刺伤"
]),
([      "action" : "$N神声凝重，$w上劈下切左右横扫，挟雷霆万钧之势逼往$n，「" HIR "伏摩剑" NOR
                   "」的剑意表露无遗",
        "force" : 90,
        "attack": 70,
        "dodge" : 75,
        "parry" : 70,
        "damage": 90,
        "lvl" : 77,
        "damage_type" : "刺伤"
]),
([      "action" : "却见$N突然虚步提腰，使出酷似武当「" HIG "蜻蜓点水" NOR "」的一招",
        "force" : 110,
        "attack": 75,
        "dodge" : 90,
        "parry" : 75,
        "damage": 100,
        "lvl" : 84,
        "damage_type" : "刺伤"
]),
([      "action" : "$N运剑如风，剑光霍霍中反攻$n的$l，尝试逼$n自守，剑招似是「" HIR "伏魔剑" NOR
                   "」的「" HIR "龙吞式" NOR "」",
        "force" : 120,
        "attack": 80,
        "dodge" : 90,
        "parry" : 85,
        "damage": 110,
        "lvl" : 91,
        "damage_type" : "刺伤"
]),
([      "action" : "$N突然运剑如狂，一手关外的「" HIY "乱披风剑法" NOR "」，猛然向$n周身乱刺乱削",
        "force" : 150,
        "attack": 90,
        "dodge" : 70,
        "parry" : 95,
        "damage": 120,
        "lvl" : 98,
        "damage_type" : "刺伤"
]),
([      "action" : "$N满场游走，东刺一剑，西刺一剑，令$n莫明其妙，分不出$N剑法的虚实",
        "force" : 180,
        "attack": 100,
        "dodge" : 70,
        "parry" : 105,
        "damage": 130,
        "lvl" : 105,
        "damage_type" : "刺伤"
]),
([      "action" : "$N抱剑旋身，转到$n身后，杂乱无章地向$n刺出一剑，不知使的是什么剑法",
        "force" : 210,
        "attack": 110,
        "dodge" : 75,
        "parry" : 95,
        "damage": 140,
        "lvl" : 112,
        "damage_type" : "刺伤"
]),
([      "action" : "$N突然一剑点向$n的$l，虽一剑却暗藏无数后着，$n手足无措，不知如何是好",
        "force" : 230,
        "attack": 115,
        "dodge" : 90,
        "parry" : 95,
        "damage": 150,
        "lvl" : 119,
        "damage_type" : "刺伤"
]),
([      "action" : "$N剑挟刀势，大开大阖地乱砍一通，但招招皆击在$n攻势的破绽，迫得$n不得不守",
        "force" : 250,
        "attack": 120,
        "dodge" : 95,
        "parry" : 95,
        "damage": 160,
        "lvl" : 126,
        "damage_type" : "刺伤"
]),
([      "action" : "$N反手横剑刺向$n的$l，这似有招似无招的一剑，威力竟然奇大，$n难以看清剑招来势",
        "force" : 270,
        "attack": 125,
        "dodge" : 85,
        "parry" : 95,
        "damage": 170,
        "lvl" : 133,
        "damage_type" : "刺伤"
]),
([      "action" : "$N举剑狂挥，迅速无比地点向$n的$l，却令人看不出其所用是什么招式",
        "force" : 300,
        "attack": 130,
        "dodge" : 115,
        "parry" : 80,
        "damage": 180,
        "lvl" : 140,
        "damage_type" : "刺伤"
]),
([      "action" : "$N随手一剑指向$n，落点正是$n的破绽所在，端的是神妙无伦，不可思议",
        "force" : 330,
        "attack": 140,
        "dodge" : 95,
        "parry" : 100,
        "damage": 190,
        "lvl" : 147,
        "damage_type" : "刺伤"
]),
([      "action" : "$N脸上突现笑容，似乎已看破$n的武功招式，胸有成竹地一剑刺向$n的$l",
        "force" : 350,
        "attack": 150,
        "dodge" : 110,
        "parry" : 100,
        "damage": 200,
        "lvl" : 154,
        "damage_type" : "刺伤"
]),
([
        "action" : "$N将$w随手一摆，但见$n自己向$w撞将上来，神剑之威，实人所难测",
        "force" : 380,
        "attack": 155,
        "dodge" : 115,
        "parry" : 105,
        "damage": 230,
        "lvl" : 180,
        "damage_type" : "刺伤"
])
});

int valid_enable(string usage)
{
        return usage=="sword" || usage=="parry";
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int valid_learn(object me)
{
        object ob;

        if( !(ob = me->query_temp("weapon"))
        ||   (string)ob->query("skill_type") != "sword" )
                return notify_fail("你必须先找一把剑才能练剑法。\n");

        if (me->query("int") < 34)
                return notify_fail("你的天资不足，无法理解独孤九剑的剑意。\n");

        if (me->query("character") == "心狠手辣")
                return notify_fail("你一心想杀尽敌人，没能理解独孤九剑的的真正含义。\n");

        if (me->query("character") == "阴险奸诈")
                return notify_fail("你一心想怎么学好剑法去害人，结果没能理解独孤九剑。\n");

        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗道：什么独孤九剑，乱七八糟的，没有半点气势。\n");

        if (me->query_skill("sword", 1) < me->query_skill("lonely-sword", 1))
                return notify_fail("你的基本剑法造诣有限，无法理解更高深的独孤九剑。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("独孤九剑只能通过「总诀式」来演练。\n");
}

string perform_action_file(string action)
{
        return __DIR__"lonely-sword/" + action;
}

int difficult_level()
{
        return 400;
}
