// yujiashu.c 瑜珈术

inherit FORCE;

string *dodge_msg = ({
        "$n前后脚脚尖脚跟相靠，身体如行云流水般滑出丈余。\n",
        "$n双臂前伸，全身贴地平飞，顿时闪过了$N的凌厉攻势。\n",
        "$n足不动，手不抬，一转眼间便绕到了$N的身后。\n",
        "$n一转身间，四面八方飘动着无数个$n的身影，令$N手无足措。\n",
        "$n全身笔直，拔地而起，在半空中一转，已落到几丈远的地方。\n",
        "$n两臂鹏举如翼，在剌剌风声中，从$N头顶横跃而过。\n",
        "$n双脚点地，全身化为一道白影，急速绕着$N打了几转。\n",
        "$n身体如陀螺般急转，气流形成一个个漩涡，令$N陷身其间，动弹不得。\n",
});

int valid_enable(string usage)
{
	return usage == "force" || usage == "dodge";
}

int valid_force(string force)
{
        return force == "hunyuan-yiqi" ||
               force == "shaolin-xinfa";
}

int query_neili_improve(object me)
{
    int lvl;

    lvl = (int)me->query_skill("yujiashu", 1);
    return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_learn(object me)
{
    	if (me->query_skill("force", 1) < 100)
		return notify_fail("你的基本内功火候不够，无法学习瑜珈术！\n");

	if (me->query("gender") != "男性")
		return notify_fail("你不是男性，无法练习瑜珈术神功。\n");

	return ::valid_learn(me);
}


int practice_skill(object me)
{
	return notify_fail("瑜珈术只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
	return __DIR__"yujiashu/" + func;
}
