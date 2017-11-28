inherit SKILL;
#include <ansi.h>

string *dodge_msg = ({
        "只见$n清啸一声，身体向上笔直地纵起丈余，躲过了$N这一招。\n",
        "$n身形飘忽，灵巧无比，轻轻向后一纵，早已避开。\n",
        "只见$n身行随意转，如同水蛇一般，倏地往一旁挪开了三尺，避过了这一招。\n",
        "可是$n着地一个猛翻，侧身一让，$N这一招扑了个空。\n",
        "却见$n蛮腰摆动，足不点地，往旁窜开数尺，躲了开去。\n",
        "$n飞身跃起，在半空中一个翻滚，身形一晃，有惊无险地避开了$N这一招。\n"

});

int valid_enable(string usage) 
{ 
        return (usage == "dodge") || (usage == "move"); 
}

mapping *action = ({
([      "action":"$N身行忽而随意转动，如同水蛇一般，忽而飞身跃起，在半空中一个翻滚，招式怪异之极"
]),
});

mapping query_action(object me, object weapon)
{
        return action[0];
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 150)
                return notify_fail("你的体力太差了，不能练习蛇行狸翻。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的内力太差了，不能练习蛇行狸翻。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -150);
        return 1;
}
mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mixed result;
        int ap, dp, mp;

        if ((int)me->query_skill("shexing-lifan", 1) < 100 ||
            ! living(me))
                return;

        mp = ob->query_skill("count", 1);
        ap = ob->query_skill("dodge") + mp;
        dp = me->query_skill("dodge", 1) * 2 / 5 +
             me->query_skill("shexing-lifan", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(3))
                {
                case 0:
                        result += (["msg" : HIW "$n" HIW "身形飘忽，灵巧无比，$N" HIW
                                            "顿觉眼前幻象万千，这招竟然落空。\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : HIW "$n" HIW "猛然飞身跃起，在半空中一个翻滚，"
                                            "竟避开了$N" HIW "这招。\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIW "$N" HIW "一招攻出，$n" HIW "身形猛转，犹"
                                            "如灵蛇一般，轻松地避开了$N" HIW "这招，令$N" HIW 
                                            "难以琢磨。\n" NOR]);
                        break;
                }
                return result;
        } else
        if (mp >= 100)
        {
                switch (random(4))
                {
                case 0:
                        result = HIY "但见$n" HIY "身形飘忽不定，灵巧无比，"
                                 "顿时出现无数幻影，令人眼花缭乱。可是$N"
                                 HIY "招式却是毫无停滞，随意施展。\n" NOR;
                        break;
                case 1:
                        result = HIY "$n" HIY "猛然飞身跃起，在半空中一个翻滚。然而$N"
                                 HIY "早已看破其中虚实，招式忽转，袭向$n" HIY "。\n" NOR;
                        break;

                default:
                        result = HIY "但见$n" HIY "身形猛转，犹如灵蛇一般，令人难以琢磨。$N"
                                 HIY "微微一笑，招式猛然加快。\n" NOR;
                        break;
                }
                COMBAT_D->set_bhinfo(result);
        }
}



string perform_action_file(string action)
{
        return __DIR__"shexing-lifan/" + action;
}
