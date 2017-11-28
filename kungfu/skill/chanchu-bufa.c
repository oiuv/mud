// chanchu_bufa.c 蟾蜍步法

inherit SKILL;

string *dodge_msg = ({
	"只见$n一招「蟾飞九天」，身体向上笔直地纵起丈余，躲过了$N这一招。\n",
	"但是$n一个使出「蛙鸣震天」，身形飘忽，轻轻一纵，早已避开。\n",
	 "$n一招「蛙入稻田」，身行随意转，倏地往一旁挪开了三尺，避过了这一招。\n",
	"可是$n一个「蟾蜍扑虫」，侧身一让，$N这一招扑了个空。\n",
	"却见$n「蟾翻白肚」，足不点地，往旁窜开数尺，躲了开去。\n",
	"$n身形一招「金蟾归月」，身形微晃，有惊无险地避开了$N这一招。\n"
});

int valid_enable(string usage) { return usage == "dodge"; }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
	return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
	if( (int)me->query("qi") < 45 )
		return notify_fail("你的体力太差了，不能练蟾蜍步法。\n");

	me->receive_damage("qi", 40);
	return 1;
}

