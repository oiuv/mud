// check.c

#include <ansi.h>
inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob, man, *all;
	mapping skl, lrn, map;
	string msg, *sname, *mapped;
	int sp, dp;
	int i, cost;
        int lvl, sklvl;
        int precise;

	seteuid(getuid());

        if (me->query("family/family_name") != "丐帮")
		return notify_fail("你不知道如何向人查探情报。\n");

        if ((sklvl = me->query_skill("checking", 1)) < 30)
		return notify_fail("你的打探本领尚未纯熟，无法"
				   "了解别人的技能。\n");

	all = all_inventory(environment(me));

	for (i = 0; i < sizeof(all); i++)
	{
		if (living(all[i])
                   && ! userp(all[i])
                   && all[i]->query("can_speak")
                   && ! all[i]->query("not_living"))
		{
			man = all[i];
			break;
		}
	}

	if (! objectp(man))
		return notify_fail("你周围又没人，没办法打听。\n");

	if (! arg)
		return notify_fail("你要打听谁的技能？\n");

        if (present(arg, environment(me)))
		return notify_fail("你要打听的人就在边上，在这里"
				   "问不大妥当吧？\n");

	ob = find_player(arg);
	if (! ob) ob = find_living(arg);
	if (! ob) return notify_fail("你要打听谁的技能？\n");

	if (ob == me)
		return notify_fail("不至于吧，要别人告诉你自己的技能？\n");

	cost = me->query("max_jing") / (sklvl / 10) - 10;
        if (cost < 40) cost = 30 + random(10);

	if (me->query("jing") <= cost)
		return notify_fail("现在你太累了，无法去打听别人的技能。\n");

        if (ob->query("special_skills/emperor"))
                return notify_fail("此人乃真命天子，无法探知其属性。\n");

        me->receive_damage("jing", cost);

	tell_object(me, WHT "\n你走上前去，小心翼翼地向" + man->name() +
                        WHT "打听关于" + ob->name() + WHT "的情况。\n" NOR);

	message("vision", WHT "只见" + me->name() + WHT "陪着笑脸，跟" +
			  man->name() + WHT "说着话，好象在打听些什么。"
                          "\n" NOR, environment(me), ({ me, man }) );

	sp = me->query_skill("checking") * 10 + 
	     me->query("jing") * 3;

	dp = ob->query("jing") * 2;

	if (userp(ob) && me->query("combat_exp") <
                         ob->query("combat_exp") * 2 / 3)
		return notify_fail(CYN + man->name() + CYN "皱着眉道：那"
                                   + ob->name() + CYN "比你强多了，你没事"
                                   "去招惹他做甚？\n" NOR);

	if (random(sp) < random(dp))
		return notify_fail(CYN + man->name() + CYN "摇了摇头，说"
                                   "道：我记不大清楚了，你还是去向问别人"
                                   "吧。\n" NOR);

        msg = HIG + man->name() + HIG "悄悄告诉你：" +
              ob->name() + HIG;

	skl = ob->query_skills();

	if (! sizeof(skl))
	{
                msg += "啥都不会，打听他干嘛？\n" NOR;
		write(msg);
		return 1;
	}

	sname  = sort_array(keys(skl), (: strcmp :));
	
	map = ob->query_skill_map();
	if (mapp(map)) mapped = values(map);
	if (! mapped) mapped = ({});

	lrn = ob->query_learned();
	if (! mapp(lrn)) lrn = ([]);
	
	i = random(sizeof(skl));

        // 这个是打听到的技能的精确度
        precise = 1000 / sklvl;
        lvl = (skl[sname[i]] + precise / 2) / precise * precise;

        msg += "修炼过" + to_chinese(sname[i]) + "，估计修炼到" +
               chinese_number(lvl) + "级了吧。\n" NOR;

	if (me->can_improve_skill("checking"))
		me->improve_skill("checking", random(me->query("int")));

        write(msg);
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式：check|dating [<某人>]

这个指令可以让你打听别人所学过的技能。你也可以指定一个和你有
师徒关系的对象，用 skills | cha 可以查知对方的技能状况。此命
令为丐帮弟子专用，并需学习相应的技能。如果技能不高，那么打听
出来的可能会有一些出入。如果打探目标是玩家的话，且武学强过打
探者太多，则打探不出任何消息。

HELP);
        return 1;
}
