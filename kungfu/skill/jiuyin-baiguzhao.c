#include <ansi.h>
inherit SKILL;

mapping *action = ({
([  "action": "$N左爪虚晃，右爪蓄力，一招「勾魂夺魄」直插向$n的$l",
    "force" : 250,
    "attack": 45,
    "dodge" : 10,
    "parry" : 18,
    "damage": 30,
    "lvl"   : 0,
    "skill_name" : "勾魂夺魄" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N双手连环成爪，爪爪钩向$n，「九子连环」已向$n的$l抓出",
    "force" : 270,
    "attack": 50,
    "dodge" : 20,
    "parry" : 26,
    "damage": 45,
    "lvl"   : 40,
    "skill_name" : "九子连环" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N双手使出「十指穿心」，招招不离$n的$l",
    "force" : 300,
    "attack": 60,
    "dodge" : 20,
    "parry" : 32,
    "damage": 45,
    "lvl"   : 70,
    "skill_name"  : "九子连环" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N身形围$n一转，使出「天罗地网」，$n的$l已完全笼罩在爪影下",
    "force" : 340,
    "attack": 85,
    "dodge" : 30,
    "parry" : 55,
    "damage": 55,
    "lvl"   : 100,
    "skill_name" : "天罗地网" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N使一招「风卷残云」，双爪幻出满天爪影抓向$n全身",
    "force" : 370,
    "attack": 110,
    "dodge" : 40,
    "parry" : 68,
    "damage": 70,
    "lvl"   : 130,
    "skill_name" : "风卷残云" ,
    "damage_type" : "抓伤"
]),
([  "action": "$N吐气扬声，一招「唯我独尊」双爪奋力向$n天灵戳下",
    "force" : 420,
    "attack": 140,
    "dodge" : 50,
    "parry" : 85,
    "damage": 90,
    "lvl"   : 160,
    "skill_name" : "唯我独尊" ,
    "damage_type" : "抓伤"
]),
});

int valid_enable(string usage) { return usage == "claw" || usage == "parry"; }

int valid_combine(string combo) { return combo=="cuixin-zhang"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
            return notify_fail("练九阴白骨爪必须空手。\n");

        if ((int)me->query("max_neili") < 800)
            return notify_fail("你的内力太弱，无法练九阴白骨爪。\n");

        if ((int)me->query_str() < 30)
            return notify_fail("你现在膂力孱弱，还无法练九阴白骨爪。\n");

        if ((int)me->query_skill("force") < 90)
            return notify_fail("你的内功太差，无法练九阴白骨爪。\n");

        if ((int)me->query_skill("claw", 1) < 60)
            return notify_fail("你的基本爪法太差，无法领会九阴白骨爪。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("jiuyin-baiguzhao", 1))
            return notify_fail("你的基本爪法火候不够，无法领会更高深的九阴白骨爪。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action); i > 0; i--)
                if (level >= action[i - 1]["lvl"])
                        return action[i - 1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("jiuyin-baiguzhao",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
//      object obj;
        object *obs;
        int /*i,*/ skill/*, damage*/;

        skill = me->query_skill("jiuyin-baiguzhao", 1);
        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的内力不够练九阴白骨爪。\n");

        if (environment(me)->query("no_fight"))
                return notify_fail("这里不能练功。\n");

        if (environment(me)->query("sleep_room"))
                return notify_fail("这里练功会打扰别人休息。\n");

        if (skill < 200)
        {
                obs = filter_array(all_inventory(environment(me)),
                                   (: (base_name($1) == CORPSE_OB &&
                                       ! $1->query("been_cut/head") ||
                                       base_name($1) == "/clone/misc/head") &&
                                      ! $1->query_temp("clawed_by_jiuyin") :));
                if (sizeof(obs) < 1)
                        return notify_fail("练九阴白骨抓需有尸体或是完好的头盖骨。\n");

                me->add("neili", -450);
        }

        me->receive_damage("qi", 80);
        me->add("neili", -40);
        if (skill < 200)
        {
                message_vision(HIB "只见$N" HIB "左手上圈下钩、左旋右转，连变了"
                               "七八般花样，蓦地里右手一伸，噗的一响，五根手指直"
                               "插入\n头骨的脑门。随后五根手指" HIR "血淋淋"
                               HIB "的提将起来。\n" NOR, me);

                if (base_name(obs[0]) == "/clone/misc/head")
                        obs[0]->set("long", obs[0]->query("long") +
                                    "上面赫然有五个小洞，伸手一探，刚好可以插入。\n");

                obs[0]->set_temp("clawed_by_jiuyin", 1);
                me->improve_skill("jiuyin-baiguzhao", 100 + skill * 5 + random(500));
        }

        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        if (damage_bonus < 100) return 0;

        if (damage_bonus / 5 > victim->query_str())
        {
                victim->receive_wound("qi", (damage_bonus - 100) / 2);
                return HIR "你听到「咔嚓」一声脆响，竟像是骨骼碎裂的声音！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"jiuyin-baiguzhao/" + action;
}