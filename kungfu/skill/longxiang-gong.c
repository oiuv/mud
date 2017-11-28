#include <ansi.h>
inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("longxiang-gong", 1);
        return lvl * lvl * 15 * 18 / 100 / 200;
}

mapping *action = ({
([      "action" : "$N单掌一抖，运聚龙象般若功功力，呼啸着向$n的$l处拍去",
        "dodge"  : 37,
        "force"  : 430,
        "attack" : 173,
        "parry"  : 41,
        "damage" : 133,
        "damage_type": "内伤" 
]), 
([      "action" : "$N右拳横移，左掌运起龙象般若功的劲力，猛地拍向$n的$l",
        "dodge"  : 35,
        "force"  : 440,
        "attack" : 177,
        "parry"  : 47,
        "damage" : 121,
        "damage_type": "内伤"
]), 
([      "action" : "$N吐气扬声，双拳同时运满龙象般若功功力，朝$n$l处贯去",
        "dodge"  : 37,
        "force"  : 450,
        "attack" : 182,
        "parry"  : 46,
        "damage" : 123,
        "damage_type": "内伤"
]),
([      "action" : "$N运足龙象般若功，双拳平推，顿时一股凌厉的罡劲直袭$n",
        "dodge"  : 27,
        "force"  : 480,
        "attack" : 183,
        "parry"  : 35,
        "damage" : 145,
        "damage_type": "内伤"
]), 
});

int valid_enable(string usage)
{ 
        int lvl;
        lvl = (int)this_player()->query_skill("longxiang-gong", 1);

        if (lvl >= 150)
                return usage == "force" ||
                       usage == "parry" ||
                       usage == "unarmed";

        else if (lvl >= 30)
                return usage == "force";

        else
                return usage == "";
}

int valid_force(string force)
{
        return force == "mizong-neigong" ||
               force == "xiaowuxiang" ||
               force == "xuedao-dafa";
}

int valid_learn(object me)
{
        int lvl, layer;

        lvl = me->query_skill("longxiang-gong", 1);
        layer = lvl / 30;

        if (layer > 13) layer = 13;

        if ((int)me->query("str") < 36)
                return notify_fail("你的先天膂力孱弱，无法修炼龙象般若功。\n");

        if ((int)me->query("con") < 30)
                return notify_fail("你的先天根骨孱弱，无法修炼龙象般若功。\n");

        if (me->query("gender") == "无性" && layer >= 1)
                return notify_fail("你无根无性，阴阳不调，无法修炼龙象般若功。\n");

        if ((int)me->query_skill("lamaism", 1) < 100)
                return notify_fail("你对密宗心法理解不够，难以领会龙象般若功。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功火候不足，难以领会龙象般若功。\n");

        if ((int)me->query("max_neili", 1) < 1000)
                return notify_fail("你的内力修为不足，难以领会龙象般若功。\n");

        if (me->query_skill("force", 1) < lvl)
                return notify_fail("你的基本内功水平不够，难以修炼更深厚的龙象般若功。\n");

        if ((int)me->query("max_neili", 1) < layer * 500)
                return notify_fail("你的内力修为不够，难以修炼更深厚的龙象般若功。\n");

        if ((int)me->query_skill("lamaism", 1) < 390 && me->query_skill("lamaism", 1) < layer * 25)
                return notify_fail("你对密宗心法理解不够，难以修炼更深厚的龙象般若功。\n");

        if (me->query_skill("unarmed", 1) < lvl && layer >= 5)
                return notify_fail("你的基本拳脚水平不够，难以修炼更深厚的龙象般若功。\n");

        return ::valid_learn(me);
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl, layer;

        lvl = me->query_skill("longxiang-gong", 1);
        layer = lvl / 30;

        if (layer > 13) layer = 13;

        if (damage_bonus < 130
           || layer < 6
           || me->query("neili") < 500
           || me->query_temp("weapon")
           || me->query_temp("secondary_weapon")
           || me->query_skill_mapped("force") != "longxiang-gong"
           || me->query_skill_mapped("unarmed") != "longxiang-gong"
           || me->query_skill_prepared("unarmed") != "longxiang-gong"
           || damage_bonus / 6 < victim->query_con()
           || random(10) < 5)
                return 0;

        if (layer >= 10 && random(2) == 1)
        {
                me->add("neili", -80);
                victim->receive_wound("qi", (damage_bonus - 50) / 3, me);
                return HIY "$N" HIY "拳锋之上竟蕴藏着『" HIR "十龙十象"
                       HIY "』之力，罡劲破体，摧毁了$n" HIY "的真元！\n" NOR;
        } else
        {
                me->add("neili", -50);
                victim->receive_wound("qi", (damage_bonus - 100) / 3, me);
                return HIY "$N" HIY "双拳暗含龙象般若功第" + chinese_number(layer) +
                       "层功力，$n" HIY "心脉受震，喷出一口鲜血！\n" NOR;
        }
}

int practice_skill(object me)
{
        return notify_fail("龙象般若功只能用学(learn)来增加熟练度。\n");
}

void skill_improved(object me)
{
        int lvl, layer;

        lvl = me->query_skill("longxiang-gong", 1);
        layer = lvl / 30;
        
        //增加真·般若极领悟
        if (lvl > 400 && ! me->query("can_perform/longxiang-gong/zhen"))
        {
                tell_object(me, HIR "你突然灵犀一动，领悟出数百年无人练成的真·般若极秘诀！\n" NOR);
                me->set("can_perform/longxiang-gong/zhen", 1);
        }

        if ((lvl % 30) == 0 && layer > 13)
        {
                tell_object(me, HIY "你的龙象般若功又进了一层。\n" NOR);
        } else
        if ((lvl % 30) == 0)
        {
                tell_object(me, HIY "你炼成了第" + chinese_number(layer) +
                                "层的龙象般若功。\n" NOR);
        }
}

int difficult_level()
{
        return 600;
}

string perform_action_file(string action)
{
        return __DIR__"longxiang-gong/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"longxiang-gong/exert/" + action;
}
