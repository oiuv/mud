// yixingbu.c 意形步法
inherit SKILL;

string *dodge_msg = ({
	"$n漫不经心的向左迈出一步，刚好避过$N的凌厉攻势。\n",
	"可是$n不紧不慢往右走了一步，躲过了$N这一招。\n",
        "但是$n身形飘忽，轻轻一纵，早已避开。\n",
        "$n身随意转，倏地往一旁挪开了三尺，避过了这一招。\n",
        "可是$n侧身一让，$N这一招扑了个空。\n",
        "却见$n足不点地，往旁窜开数尺，躲了开去。\n",
        "$n身形微晃，有惊无险地避开了$N这一招。\n",
        "$n看似无心地信手一拂，肩头微侧,堪堪避过了$N这一招。\n"
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move"); }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，练不了意形步法。\n");

        me->receive_damage("qi", 40);
        return 1;
}

