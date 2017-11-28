// qingfu-shenfa.c 青蝠身法
// pal 1997.05.26
// modify by rcwiz 2003

#include <ansi.h>

inherit SKILL;

string *dodge_msg = ({
	"只见$n一招「福满乾坤」，身形陡然纵起，躲过了$N这一招。\n",
	"$n一式「五蝠献寿」，身形晃动，向一旁飘出，避开了$N这一招。。\n"
	"$n使出「洞天福地」，一个空心筋斗向后翻出，避开了$N的凌厉攻势。\n",
	"$n一招「云龙百蝠」，身随意转，$N只觉眼前一花，$n已绕至$N的身后。\n",
});

int valid_enable(string usage)
{
	return (usage == "dodge") || (usage == "move");
}

int valid_learn(object me)
{
        if (me->query("dex") < 26)
                return notify_fail("你先天身法太差，无法学习青蝠身法。\n");

        if (me->query_skill("dodge", 1) < 100)
                return notify_fail("你轻功根基不足，无法学习青蝠身法。\n");

        return 1;
}


string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("qingfu-shenfa", 1);
        if (lvl < 50)  return 0;
        if (lvl < 100) return 10;
        if (lvl < 150) return 20;
        if (lvl < 200) return 30;
        if (lvl < 250) return 40;
        if (lvl < 300) return 50;
        if (lvl < 350) return 60;
        return 80;
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("qingfu-shenfa", 1) < 100 ||
            //! living(me) || random(3) != 1)
            ! living(me) || random(2) != 1)
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("dodge") + mp;
        dp = me->query_skill("dodge", 1) / 2 +
             me->query_skill("qingfu-shenfa", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(2))
                {
                case 0:
                        result += (["msg" : HIG "只见$n" HIG "长啸一声犹如一只蝙"
                                            "蝠一样纵身而起，于半空倒立，$N" HIG 
                                            "这招却扑了个空。\n" NOR]);
                        break;

                default:
                        result += (["msg" : HIG "但见$n" HIG "身法轻盈无比，忽然跃"
                                    "高忽而落下，令$N" HIG "完全无从攻击。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(2))
                {
                case 0:
                        result = HIY "只见$n" HIY "长啸一声犹如一只蝙"
                                 "蝠一样纵身而起，于半空倒立，可是$N"
                                 HIY "精通易理，将其中虚实辨得清清楚楚。\n" NOR;

                default:
                        result = HIY "但见$n" HIY "身法轻盈无比，忽然跃"
                                     "高忽而落下，$N" HIY "不假思索，飞"
                                     "身出招，更是巧妙无方。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}


int practice_skill(object me)
{
        if( (int)me->query("qi") < 60 )
                return notify_fail("你的体力太低了，不能练青蝠身法。\n");

        if( (int)me->query("neili") < 60 )
                return notify_fail("你的内力不够练青蝠身法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -55);
        return 1;
}

