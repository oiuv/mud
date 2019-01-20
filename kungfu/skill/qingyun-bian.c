
#include <ansi.h>

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action":"$N一招"HIR" 聚火 "NOR",手扬鞭起，手中$w将$n团团围住，内力一吐，鞭圈匀速缩小。",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        -10,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "聚火",
        "damage_type":  "内伤"
]),
([      "action":"$N左手虚幻，右手$w一招"HIC" 起光 "NOR",手中$w由似一条青龙迅速击向$n。",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        5,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "起光",
        "damage_type":  "刺伤"
]),
([      "action":"$N腾空而起，手中$w舞成圆环，一招"HIB" 招雨 "NOR"压向$n,令$n无处可躲。",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        10,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "招雨",
        "damage_type":  "内伤"
]),
([      "action":"$N力贯鞭梢，一招"HIR" 动雷 "NOR"，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        -5,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "动雷",
        "damage_type":  "淤伤"
]),
([      "action":"$N往前一纵, 但见$N身形一转，一招"HIC" 移电 "NOR"，手中$w如鬼魅一般，神不知鬼不觉地袭向$n的$l！",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        -10,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "移电",
        "damage_type":  "刺伤"
]),
([      "action":"$N手持$w,力贯鞭稍，一招"HIR" 剪虹 "NOR"手中$w犹如彩虹般击向$n,已将$n笼罩于鞭下。",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        -20,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name":  "剪虹",
]),
([      "action":"$N左手虚晃，右脚突然向前迈出，一招"CYN" 止风 "NOR"，右手$w如同鬼魅一般无声无息的刺向$n!",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        0,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "止风",
        "damage_type":  "刺伤"
]),
([      "action":"$N向前纵出，身体飞过$n头顶，一招"HIW" 断云 "NOR"手中$w击向$n的$l",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        100,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "断云",
        "damage_type":  "内伤"
]),
([      "action":"$N手中$w晃出满天鞭影，一招"HIB" 遮月 "NOR"虚虚实实的鞭影，铺天盖地的击向$n",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        50,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "遮月",
        "damage_type":  "淤伤"
]),
([      "action":"$N一招"YEL" 掩日 "NOR"手中$w形似蛟龙又似飞蝗,密不透风的罩向$n！",
        "force":        (int)this_player()->query("max_neili")/4,
        "dodge":        40,
        "damage":       (int)this_player()->query("shen")/1500,
        "skill_name" : "掩日",
        "damage_type":  "淤伤"
]),
});

        int valid_enable(string usage) { return (usage == "parry"); }

int valid_learn(object me)
{
        object weapon;
        int lvl = (int)me->query_skill("qingyun-bian", 1);
        int t = 1; 
        if( (int)me->query("max_neili") < 500 )
                return notify_fail("你的内力不足，没有办法练青云鞭法, 多练些内力再来吧。\n");

        if ((int)me->query_skill("shaolin-xinfa", 1) < 80)
                return notify_fail("你的少林心法火候太浅。\n");

        if ( !objectp(weapon = me->query_temp("weapon"))
                || ( string)weapon->query("skill_type") != "whip" )
                return notify_fail("你必须先找一条鞭子才能练鞭法。\n");

         if(lvl<=150)
        {
                if (lvl > 10 && (int)me->query("shen") < t * 20)
                        return notify_fail("你的正气太低了。\n");
        }
        else
        {
                if ((int)me->query("shen") < (11100 + (lvl - 100) * 1000))
                        return notify_fail("你的正气太低了。\n");
        }
        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("qingyun-bian", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
                || (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练青云鞭法。\n");
        me->receive_damage("qi", 30);
        return 1;
}

string perform_action_file(string action)
{
                return __DIR__"qingyun-bian/" + action;
}
