#include <ansi.h>
inherit SKILL;

string *parry_msg = ({
        "却见$n双手轮转，护住周身，顿时将$N的招数全全封锁。\n",
        "但是$n身形急变，内劲迸发，将$N的攻势阻隔开来。\n",
        "但是$n身子微侧，双手同时一拨，已将$N的招数卸于无形。\n",
});

string query_parry_msg(object weapon)
{
        return parry_msg[random(sizeof(parry_msg))];
}

int valid_enable(string usage)
{
	return usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("taoism", 1) < 150)
                return notify_fail("你对道学理解不够深入，无法学习金关玉锁。\n");

        if ((int)me->query_skill("force", 1) < 150)
                return notify_fail("你的基本内功火候不够，无法学习金关玉锁。\n");

        if ((int)me->query_skill("parry", 1) < 150)
                return notify_fail("你的基本招架火候不够，无法学习金关玉锁。\n");

        if ((int)me->query("max_neili") < 1800)
                return notify_fail("你目前的内力修为不足，无法学习金关玉锁。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("jinguan-yusuo", 1))
                return notify_fail("你的基本内功水平有限，无法领会更高深的金关玉锁。\n");

        if ((int)me->query_skill("parry", 1) < (int)me->query_skill("jinguan-yusuo", 1))
                return notify_fail("你的基本招架水平有限，无法领会更高深的金关玉锁。\n");

        return 1;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int) me->query_skill("jinguan-yusuo", 1) < 100 ||
            ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("force", 1) + mp;
        dp = me->query_skill("jinguan-yusuo", 1);

        // 因为后期可以练习，所以保证出现卸招的几率低
        if (ap / 2 + random(ap) < dp * 3 / 4)
        {
                result = ([ "damage" : -damage ]);

                switch (random(3))
                {
                case 0:
                        result += ([ "msg" : YEL "$n" YEL "面含微笑，双手回"
                                             "圈，顿时将$N" YEL "的招数全全"
                                             "锁死。\n" NOR ]);
                        break;
                case 1:
                        result += ([ "msg" : YEL "$n" YEL "单掌轻轻撩起，掌"
                                             "劲吞吐，竟凭空架起一道气墙，将$N"
                                             YEL "的攻势全然阻隔在外。\n" NOR ]);
                        break;

                default:
                        result += ([ "msg" : YEL "却见$n" YEL "掌出如风，飘"
                                             "忽不定，轻描淡写将$N" YEL "的"
                                             "攻击卸之于无形。\n" NOR ]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(3))
                {
                case 0:
                        result = HIY "$n" HIY "双手回圈，企图锁死$N" HIY "的"
                                 "招数，可陡然间却见$N" HIY "撤手回转，再攻出"
                                 "一招。\n" NOR;
                        break;

                case 1:
                        result = HIY "$n" HIY "单掌轻轻撩起，欲以内劲阻挡$N"
                                 HIY "的攻势，可$N" HIY "蓦的变招，从另一方"
                                 "位攻入。\n" NOR;
                        break;

                default:
                        result = HIY "$n" HIY "掌出如风，飘然护住全身，可$N"
                                 HIY "理也不理，只管运足内劲，中破攻入。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int practice_skill(object me)
{
        if (me->query_skill("jinguan-yusuo", 1) < 200)
                return notify_fail("你对金关玉锁了解甚浅，不足以自行锻炼。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -90);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jinguan-yusuo/" + action;
}
