// hunyuan-yiqi.c 少林 混元一气功
// dts@xkx, cleansword@xkx

inherit FORCE;

int valid_enable(string usage)
{
	return usage == "force";
}

int query_neili_improve(object me)
{
	int lvl;

	if (me->query("sex"))
		return 0;

        lvl = (int)me->query_skill("hunyuan-yiqi", 1);
        return lvl * lvl * 15 * 21 / 100 / 200;
}

int valid_force(string force)
{
        return force == "yijinjing" ||
               force == "taiji-shengong" ||
               force == "wudang-xinfa" ||
               force == "shaolin-xinfa";
}

int valid_learn(object me)
{
	int /*i,*/ nb, nf, nh, ns/*, ts*/;
	nb = (int)me->query_skill("buddhism", 1);
	nf = (int)me->query_skill("force", 1);
	nh = (int)me->query_skill("hunyuan-yiqi", 1);
	ns = (int)me->query("guilty");

   	if ( me->query("couple/have_couple") )
		return notify_fail("你已经破了色戒，无法再学习混元一气功！\n");

	if ( me->query("gender") != "男性" )
		return notify_fail("你非童男之体，不能练习混元一气功。\n");

	if ( nb < 300 && nb < nh )
		return notify_fail("你的禅宗心法修为不够，无法领会更高深的混元一气功。\n");

    if ( nf < 30)
        return notify_fail("你的基本内功火候还不够，无法学习混元一气功。\n");

	if ( nf < nh)
		return notify_fail("你的基本内功火候还不够，无法领会更高深的混元一气功。\n");

	if ( ns > 0 ) 
		return notify_fail("你屡犯僧家数戒，无法领会更高深的混元一气功。\n");

	return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("混元一气功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
	return __DIR__"hunyuan-yiqi/" + func;
}