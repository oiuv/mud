inherit SKILL;

string *dodge_msg = ({
    	"只见$n一招「旱地拔葱」，身体向上笔直地纵起丈余，躲过了$N这一招。\n",
    	"$n一个「雨燕归巢」，向后纵出数丈之远，避开了$N的凌厉攻势。\n",
    	"$n使出「破土而出」，向一旁飘然纵出，轻轻着地。\n"
    	"但是$n身形飘忽，一招「无中生有」轻轻一纵，早已避开。\n",
    	"$n身随意转，一招「乘风而去」倏地往一旁挪开了三尺，避过了这一招。\n",
    	"可是$n侧身一让，一招「鲧化大鹏」$N这一招扑了个空。\n",
    	"却见$n足不点地，一招「青云直上」往旁窜开数尺，躲了开去。\n",
    	"$n身形微晃，一招「凤翔九天」有惊无险地避开了$N这一招。\n"
});

int valid_enable(string usage)
{
	return usage == "dodge" || usage == "move";
}

int valid_learn(object me)
{
	return 1;
}

string query_dodge_msg(string limb)
{
    	return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    	if( (int)me->query("qi") < 50 )
       		return notify_fail("你的体力太差了，不能练天南身法。\n");

    	me->receive_damage("qi", 40);
    	return 1;
}
