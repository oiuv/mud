// five-avoid.c ŒÂ––∂›
// Modified by Venus Oct.1997
// written by deaner
#include <ansi.h>
inherit SKILL;

mapping *action = ({
([  "action" : "ø… «$nŒ¢Œ¢“ª–¶£¨$N—€«∞ÀÆŒÌ√÷¬˛£¨$n“— π≥ˆ"+HIC"°∫ÀÆ∂›°ª"NOR+"ΩËÀÆ∂¯ ≈°£\n",
    "dodge"  : 60
]),
([  "action" : "»¥º˚$n≈◊œ¬ ÷÷–±¯»–£¨∆ÀœÚ¬∑±ﬂµƒ“ªø√¥Û ˜£¨◊™—€∫Õ÷¶“∂ªÏŒ™“ªÃÂ£¨"
               "$N√£»ªÀƒπÀ£¨≤ª÷™$n“—æ≠øø"+HIG"°∫ƒæ∂›°ª"NOR+"∂„ø™π•ª˜°£\n",
    "dodge"  : 70
]),
([  "action" : "$n‘≠µÿ“ª◊™£¨¡¢ ±◊Í»ÎÕ¡÷–°£$N’‚“ª’–¬‰µΩ¡Àø’¥¶£¨æ™µ¿"+HIY"°∫Õ¡"
              "∂›°ª"NOR+"£°\n",
    "dodge"  : 80
]),
([  "action" : "$nÀÊ ÷¥Ú≥ˆ“ªÕ≈ª«Ú£¨∫»µ¿"+HIR"°∫ª∂›°ª"NOR+"£° ’˚∏ˆ»Àœ˚ ß‘⁄ª
ª«Ú÷–°£\n",
    "dodge"  : 90
]),
([  "action" : "$nπ˛π˛“ª–¶£¨∞— ÷÷–µƒ±¯»–Ωª¥Ì“ªª˜£¨∫»µ¿°∞ø¥Œ“"+HIY
               "°∫Ω∂›°ª"NOR+"°±£¨Õª»ªæ´π‚“´—€£¨$N—€«∞“ªª®£¨’‚“ª’–≤ª÷™¬‰µΩ¡À∫Œ¥¶°£\n",
    "dodge"  : 100
]),
});

mapping query_action(object me, object weapon)
{
    int zhaoshu, level;

    zhaoshu = sizeof(action);
    level   = (int) me->query_skill("five-avoid",1);

    if (level < 200 )
       zhaoshu--;
    if (level < 150 )
       zhaoshu--;
    if (level < 100 )
       zhaoshu--;
    if (level < 70 )
       zhaoshu--;
    return action[random(zhaoshu)];
}
int valid_enable(string usage)
{
    return (usage=="dodge") || (usage=="move");
}

int valid_learn(object me)
{
    return 1;
}
string query_dodge_msg(string limb)
{
    object me, ob;
    mapping action;

    me = this_player();
    action = query_action(me, ob);

    return action["action"];
}

int practice_skill(object me)
{
    if( (int)me->query("qi") < 70 )
        return notify_fail("ƒ„µƒ∆¯¡¶≤ªπª,≤ªƒ‹–ﬁ¡∂ŒÂ––∂›.\n");

    me->receive_damage("qi", 65);
    return 1;
}
string perform_action_file(string action)
{
    return __DIR__"five-avoid/" + action;
}

