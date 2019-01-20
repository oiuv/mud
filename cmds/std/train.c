// train.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob/*,where*/;
//	mapping fam;
	int sp, dp;
	int /*i,*/ cost, train_level;

	seteuid(getuid());

        if (me->query_skill("training", 1) < 10)
		return notify_fail("你的驭兽术还不纯熟，无法训练野兽！\n");

	if (! arg)
		return notify_fail("你要训练什么野兽？\n");

	if (! objectp(ob = present(arg, environment(me))))
		return notify_fail("这里没有这只野兽吧？\n");

	if (userp(ob)) 
		return notify_fail("人家也是玩家，你搞什么搞啊？\n");

	if (ob->query("race") != "野兽")
		return notify_fail("这不是野兽，你晕头了吧？\n");

        if (ob->query_temp("owner") &&
            (ob->query_temp("owner") == me->query("id")))
                return notify_fail(ob->name() + "就是你驯服过的，你还折腾个啥劲儿呢！\n");

        if (ob->query_temp("owner") &&
            (ob->query_temp("owner") != me))
                return notify_fail(ob->name() + "早被人家驯服了，你还折腾个啥劲儿呢！\n");

	if (ob == me)
		return notify_fail("你没这么笨吧，把自己不当人？\n");

	if (! living(ob)) 
		return notify_fail("这只野兽晕倒了，你怎能训得它动呢？\n");

	cost = me->query("max_jing") / (me->query_skill("training", 1) / 10) - 10;

	if (me->query("jing") <= cost)
		return notify_fail("现在你太累了，无法训练野兽。\n");

	message_vision("只见$N冲着" + ob->name() +
                       "手脚乱摆，口中似对它轻轻细语。\n\n",me);

	sp = me->query_skill("training",1) + me->query("int");
	dp = ob->query("combat_exp")/100;
	
	if (random(sp) < random(dp) / 2)
	{
		ob->kill_ob(me);
                me->start_busy(1);
		return notify_fail("你驭兽术不精，那东西野"
                                   "性不泯，冲着你就窜了过来！\n");
	}

	me->receive_damage("jing", cost);
	message_vision("顿时" + ob->name() + "冲着$N摇了摇尾巴，很温驯的样子。\n\n", me);

	train_level = me->query_skill("training", 1);
	if (me->can_improve_skill("training"))
		me->improve_skill("training", random(me->query("int")));

	ob->set("attitude", "peace");
	ob->remove_all_enemy(1);
	ob->set_temp("owner", me);
	ob->set_temp("owner_name", me->query("name"));
	ob->set_temp("owner_id", me->query("id"));
        if ((strsrch(ob->query("name"), "马") >= 0) ||
            (strsrch(ob->query("name"), "驴") >= 0) ||
            (strsrch(ob->query("name"), "骡") >= 0) ||
            (strsrch(ob->query("name"), "驼") >= 0) ||
            (strsrch(ob->query("name"), "牛") >= 0) ||
            (strsrch(ob->query("name"), "象") >= 0) ||
            (strsrch(ob->query("name"), "狮") >= 0) ||
            (strsrch(ob->query("name"), "虎") >= 0) ||
            (strsrch(ob->query("name"), "豹") >= 0) ||
            (strsrch(ob->query("name"), "鹿") >= 0) ||
            (strsrch(ob->query("name"), "鲨") >= 0) ||
            (strsrch(ob->query("name"), "雕") >= 0) ||
            (strsrch(ob->query("name"), "獸") >= 0))
                ob->set("ridable", 1);
	me->remove_all_enemy();
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : train <动物>

此指令可用于驯化某动物。对于已经驯服的动物，可以进行下述指令：

基本指令：
        come <动物名>:                  让动物跟随主人行动。
        stay:                           停止动物的跟随状态。
        attack <某人>:                  让动物攻击敌人。
        stop <动物名>:                  让动物停止对人的攻击。
        release:                        结束主奴状态，将动物放离。

特殊指令：（只对某些动物适用）
        qi(ride) <动物名>:              骑，如骑马，虎，雕，鲨等。
        xia(unride) <动物名>:           下，离开坐骑。
        wei(feed) <动物名>:             替动物喂食。
        yin <动物名>:                   给动物饮水。

HELP
	);
	return 1;
}