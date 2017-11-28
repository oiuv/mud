// zhuangzi-wu.c 庄子舞

#include <ansi.h>

inherit SKILL;

string *dodge_msg = ({
        "可是$n侧身微微一让，$N这一招扑了个空。\n",
        "却见$n足不点地，往旁窜开数尺，躲了开去。\n",
        "$n身形微晃，有惊无险地避开了$N这一招。\n",
        "$n跨出几步，落点怪异莫测，让$N这一招没有发挥任何作用。\n",
        "$n自顾自的走出几步，浑然不理$N出招攻向何处。\n",
        "$N这一招眼看就要击中，可是$n往旁边一让，去点之妙，实在是匪夷所思。\n",
        "$n往前一迈，忽然后退，恰恰避开$N这一招，有惊无险。\n",
});

int valid_enable(string usage) 
{ 
        return usage == "dodge";
}

int valid_learn(object me)
{
        int lvl;

        lvl = me->query_skill("zhuangzi-wu", 1);
        if (lvl > 300) lvl = 300;

        if (me->query("dex") < 26)
                return notify_fail("你先天身法太差，无法学习庄子舞。\n");

        if (me->query("max_neili") < 2400 + lvl * 15)
                return notify_fail("你按照庄子舞所示的步法随意走了两下，顿时"
                                   "只感头晕目眩，看来是内力不济。\n");
        return 1;
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("zhuangzi-wu", 1) < 100 ||
            ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("dodge") + mp;
        dp = me->query_skill("dodge", 1) / 2 +
             me->query_skill("zhuangzi-wu", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(4))
                {
                case 0:
                        result += (["msg" : MAG "只见$n" MAG "足尖在地面轻轻一点，整个身"
                                            "子顿时凌空飘起，轻而易举躲开了$N" MAG "的招"
                                            "式。\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : MAG "可是$n" MAG "蛮腰微微一颤，步法宛如行云"
                                            "流水，轻飘飘的落在一旁，顿时使$N" MAG "的攻"
                                            "势落空。\n" NOR]);
                        break;
                case 2:
                        result += (["msg" : MAG "但见$n" MAG "微微一笑，身形轻展，整个人"
                                            "竟踏空飘起，待$N" MAG "一招击空后，又翩翩而"
                                            "落，晃至$N" MAG "跟前。\n" NOR]);
                        break;
                default:
                        result += (["msg" : MAG "可$n" MAG "竟丝毫不理会$N" MAG "的招数，"
                                            "径自迎面奔上，幻出无数倩影翩翩起舞，$N" MAG
                                            "勘不透虚实，唯有收招。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(4))
                {
                case 0:
                        result = HIY "只见$n" HIY "足尖轻点地面，凌空飘然而"
                                 "起，可$N" HIY "遁影擒踪，一声冷笑，随即飞"
                                 "身扑上。\n" NOR;
                        break;
                case 1:
                        result = HIY "$n" HIY "蛮腰微微一颤，步法宛如行云流"
                                 "水，轻飘而落，可$N" HIY "毫不理会，反手又"
                                 "攻出一招。\n" NOR;
                        break;
                case 2:
                        result = HIY "$n" HIY "微微一笑，身形轻展，整个人竟"
                                 "踏空飘起，可又见$N" HIY "也随即飘起，在半"
                                 "空攻出数招。\n" NOR;
                        break;
                default:
                        result = HIY "但见$n" HIY "身形一展，幻出无数倩影翩"
                                 "翩起舞，可$N" HIY "不假思索攻出一招，正是"
                                 "实影所在。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("zhuangzi-wu", 1);
        if (lvl < 50)  return 0;
        if (lvl < 100) return 30;
        if (lvl < 150) return 50;
        if (lvl < 200) return 70;
        if (lvl < 250) return 80;
        if (lvl < 300) return 90;
        if (lvl < 350) return 100;
        return 120;
}

int practice_skill(object me)
{
        if (me->query_skill("zhuangzi-wu", 1) < 180
	   && me->query("family/family_name") != "红花会")
                return notify_fail("你对庄子舞了解不够，还不足以自行锻炼。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太差了，难以练习庄子舞。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够了，无法练习庄子舞。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -60);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhuangzi-wu/" + action;
}
