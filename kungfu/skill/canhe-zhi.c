// 基本指法及特殊指法数种。
// 少林武功秘籍藏于慕容世家：    天竺佛指、多罗叶指、修罗指法
// 杭州灵隐寺住持「大悲尊者」：  莲花指
// 南海「孙玉溪」：              七星指
// 关东「大天龙」：              大天龙指
// 祁连山「无洞上人」：          祁连五绝指
// 岭南「幽冥道人」              幽冥指
// 演练为：
// canhe-zhi.c 参合指神功

#include <ansi.h>
#include <combat.h>
#include "/kungfu/skill/eff_msg.h";
inherit SKILL;
inherit F_SSERVER;

mapping *action = ({
([      "action": "$N双指并拢虚点而出，合「"NOR + MAG "天竺佛指" NOR "」及"
                  "「" NOR + MAG "修罗指" NOR "」为一式，顿时一股罡风直射$n",
        "force" : 480,
        "attack": 110,
        "parry" : 90,
        "dodge" : 95,
        "damage": 160,
        "weapon" : HIR "参合破体剑气" NOR,
        "damage_type" : "刺伤"
]),
([      "action": "$N双指齐点而出，合「" HIG "莲花指" NOR "」及「" HIG "多罗叶"
                  "指" NOR "」为一式，顿时剑气已笼罩$n全身各处",
        "force" : 460,
        "attack": 100,
        "parry" : 90,
        "dodge" : 115,
        "damage": 180,
        "weapon" : HIR "参合破体剑气" NOR,
        "damage_type" : "刺伤"
]),
([
        "action": "只见$N十指箕张，随手指指点点，将「" HIY "祁连五绝指" NOR "」及"
                  "「" HIY "大天龙指" NOR "」的精髓招式同时使出，\n顿时剑气纵横，尘"
                  "砂四起，逼向$n而去",
        "force" : 460,
        "attack": 100,
        "parry" : 135,
        "dodge" : 125,
        "damage": 180,
        "weapon" : HIR "参合破体剑气" NOR,
        "damage_type" : "刺伤"
]),
([
        "action": "只见$N纵身跃起，长啸一声，凌空而下，「" HIM "七星剑气" NOR "」已射"
                  "向$n全身各处",
        "force" : 460,
        "attack": 100,
        "parry" : 115,
        "dodge" : 145,
        "damage": 200,
        "weapon" : HIR "参合破体剑气" NOR,
        "damage_type" : "刺伤"
]),
([      "action": "$N伸出两指，弹指无声，陡见两缕紫气由指尖透出，「" HIW "幽冥剑气" NOR
                  "」射向$n周身大穴",
        "force" : 460,
        "attack": 120,
        "parry" : 130,
        "dodge" : 125,
        "damage": 200,
        "weapon" : HIR "参合破体剑气" NOR,
        "damage_type" : "刺伤"
]),
([      "action": "遥见$N伸出一指轻轻拂向$n，指未到，「" HIR "参合剑气" NOR "」已将$n压"
                  "得透不过气来",
        "force" : 480,
        "attack": 120,
        "parry" : 150,
        "dodge" : 165,
        "damage": 240,
        "weapon" : HIR "参合破体剑气" NOR,
        "damage_type" : "刺伤"
])
});

string main_skill() { return "canhe-zhi"; }

mapping sub_skills = ([
        "lianhua-zhi"    : 120,
        "tianlong-zhi"   : 120,
        "qilian-zhi"     : 120,
        "tianzhu-fuzhi"  : 120,
        "qixing-zhi"     : 120,
        "youming-zhi"    : 120,
        "xiuluo-zhi"     : 120,
        "duoluoye-zhi"   : 120,
]);

int get_ready(object me)
{
        return 1;
}

int get_finish(object me)
{
        // object ob;

        if (me->query("int") < 34)
        {
                tell_object(me, "你只觉依自己的悟性，无法合成参合指神功。\n");
                return 0;
        }

        if (me->query("dex") < 36)
        {
                tell_object(me, "你只觉依自己的身法灵动性，根本无法合成参合指神功。\n");
                return 0;
        }

        if (me->query_skill("literate", 1) < 200)
        {
                tell_object(me, "你觉得参合指神功极其深奥，看来多研究一下学问可能更有帮"
                                "助。\n");
                return 0;
        }

        if (me->query_skill("jingluo-xue", 1) < 160)
        {
                tell_object(me, "你演练完毕，发现如果通晓经络学应该更有所帮助。\n");
                return 0;
        }

        if (me->query_skill("martial-cognize", 1) < 200)
        {
                tell_object(me, "你发现自己的武学修养尚待提高，暂且无法演练成功。\n");
                return 0;
        }

        if (me->query_skill("force", 1) < 240)
        {
                tell_object(me, "你发现自己的内功根基不够，暂且无法演练成功。\n");
                return 0;
        }

        if ((int)me->query("max_neili") < 4500)
        {
                tell_object(me, "你觉得自己真气不继，无法合成参合指神功。\n");
                return 0;
        }

        if (random(10) < 7)
        {
                tell_object(me, "你觉得有所感悟，或许再演练一次就能融会贯通。\n");
                return 0;
        }

        tell_object(me, HIY "\n霎那间，你只觉自身所修炼的数种指法不断在脑海中交替呈\n"
                            "现，最后又如百川归海，终于融会贯通，合为本家绝学参合\n"
                            "指神功。你终于通晓了参合指的诀窍。\n" NOR);

        return 1;
}

mapping query_sub_skills()
{
        return sub_skills;
}

int valid_enable(string usage)
{
	return usage == "finger" || usage == "parry";
}

int double_attack()
{
	return 1;
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练参合指必须空手。\n");

        if ((int)me->query("int") < 34)
                return notify_fail("你的先天悟性太低，无法领会参合指。\n");

        if ((int)me->query("dex") < 36)
                return notify_fail("你的先天身法孱弱，无法修炼参合指。\n");

        if ((int)me->query_skill("force", 1) < 240)
                return notify_fail("你的内功火候不够，无法修炼合指。\n");

        if ((int)me->query("max_neili") < 4500)
                return notify_fail("你的内力太弱，无法修炼参合指。\n");

        if ((int)me->query_skill("finger", 1) < 160)
                return notify_fail("你的基本指法火候不够，无法修炼参合指。\n");

        if (me->query_skill("jingluo-xue", 1) < 160)
                return notify_fail("你发现这里面有很多奥妙都和人体的经络构造有关，难以理解。\n");

        if (me->query_skill("martial-cognize", 1) < 120)
                return notify_fail("你的武学修养尚待提高，暂且无法修炼参合指。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的参合指。\n");

        return 1;
}

int practice_skill(object me)
{
        int cost;

        if (me->query_skill("canhe-zhi", 1) > 120
            && me->query_skill("zihui-xinfa", 1) < 120)
                return notify_fail("你紫徽心法修为不够，这样下去恐怕会走火入魔！\n");

        if ((int)me->query("qi") < 130)
                return notify_fail("你的体力太低了。\n");

        cost = me->query_skill("canhe-zhi", 1) / 2 + 60;

        if ((int)me->query("neili") < cost)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -cost);
        return 1;
}

mapping query_action(object me, object weapon)
{

        if (! undefinedp(me->query_temp("canhe-action")))
                return action[me->query_temp("canhe-action")];

        if (random(10) == 1 && me->query("neili") > 1000)
        {
                me->add("neili", -300);
                return ([       "action": HIC "$N" HIC "凝神聚气，双指连续点出，指风凌"
                                          "厉，破空而出的「参合剑气」已经逼向$n",
        		        "attack": 280,
                                "dodge" : 140,
                                "parry" : 140,
                                "damage": 320,
                                "force" : 560,
                                "weapon" : HIR "参合破体剑气" NOR,
                                "damage_type": "刺伤"
		        ]);
        }

        return action[random(sizeof(action))];
}

string query_parry_msg(object victim_weapon)
{
        switch (random(3))
        {
        case 0:
                return NOR + WHT "$n" NOR + WHT"不退反进，右手食指径直指向$N" NOR + WHT
                       "胸前大穴，$N一惊，连忙回身自救。\n" NOR;
        case 1:
                return NOR + WHT "$n" NOR + WHT"双指连连点出，迅捷有力，无数道钢劲的参"
                       "合剑气护出周身，令$N" NOR + WHT"无从下手。\n" NOR;
        default:
                return NOR + WHT "$n" NOR + WHT"长啸一声，但见无数剑气自$N" NOR + WHT
                       "双指而出，笼罩在$P周围，犹如一张网一般，毫无破绽。\n";
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

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl, slv, p;
        object target;
        string msg;

        if (! target) target = offensive_target(me);
        lvl = me->query_skill("canhe-zhi", 1);

        // 身负六脉神剑绝技可以将参合剑气折回
        if (slv = target->query_skill("liumai-shenjian", 1) > 200
            && target->query_skill_prepared("finger") == "liumai-shenjian"
            && slv >= me->query_skill("canhe-zhi", 1) - 60
            && random(10) == 0)
        {
                msg = action[random(sizeof(action))]["action"];
                msg += HIY "\n但见$n" HIY "斜斜一指点出，指出如风，剑气纵横，嗤然"
                       "作响，竟将$N" HIY "的剑气全部折回，反向自己射去！\n" NOR;

                me->receive_wound("qi", slv / 4 + random(slv / 6), target);
                p = (int)me->query("qi") * 100 / (int)me->query("max_qi");
                msg += "( $N" + eff_status_msg(p) + ")\n";
                return msg;
        }

        if (damage_bonus < 220 || lvl < 140) return 0;

        if (damage_bonus / 5 > victim->query_dex()
            && random(5) == 0 && me->query("neili") > 65)
        {
                me->add("neili", -80);
                victim->receive_wound("qi", (damage_bonus - 80) / 3, me);
                	return HIR "你只听「嗤嗤嗤」破空声骤响，脸上竟溅到一些血滴！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"canhe-zhi/" + action;
}
