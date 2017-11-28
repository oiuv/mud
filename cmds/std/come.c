// come.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob;
	int cost;

	seteuid(getuid());

	if (me->is_fighting())
		return notify_fail("一边打架一边驯兽？你真是活腻了！\n");

	if (me->query_skill("training",1) < 10)
		return notify_fail("你的驭兽术还不纯熟，无法让野兽跟随你！\n");

	if (me->query_temp("comedby"))
		return notify_fail("已经有野兽跟着你了！\n");

	if (! arg)
		return notify_fail("你要让什么野兽跟随你？\n");

	if (! objectp(ob = present(arg, environment(me))))
		return notify_fail("这里没有这只野兽吧？\n");

	if (userp(ob)) 
		return notify_fail("人家也是玩家，你搞什么搞啊？\n");

	if (ob->query("race") != "野兽") 
		return notify_fail("这不是野兽，你晕头了吧？\n");

        if (ob->is_fighting())
                return notify_fail(ob->name() + "正在打架，没空理你！\n");

        if (ob->is_busy())
                return notify_fail(ob->name() + "正在忙乎，没空理你！\n");

        if (! ob->query_temp("owner"))
                return notify_fail(ob->name() + "是只无主野兽，你得先驯服(train)它啊！\n");

        if (ob->query_temp("owner") != me)
	{
		ob->kill_ob(me);
                return notify_fail(ob->name() + "早被人家驯服了，你不是找死啊！\n");
	}

	if (ob == me)
		return notify_fail("你没问题吧，自己跟自己？\n");

	if (! living(ob)) 
		return notify_fail("这只野兽晕倒了，你怎能让它跟你呢？\n");

	cost = me->query("max_jing") / (me->query_skill("training", 1) / 10) - 10;

	if (me->query("jing") <= cost)
		return notify_fail("现在你太累了，无法让野兽跟随。\n");

	message_vision("只见$N冲着" + ob->name() +
                       "手中摆了个手式，它一窜就跟上了。\n\n",me);

	me->receive_damage("jing", cost);
	me->set_temp("comedby", ob->query("id"));
	ob->set_leader(me);
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : come <动物>

此指令可用于让某动物跟随你。对于已经驯服的动物，可以进行下述指令：

基本指令：
        come <动物名>:                  让动物跟随主人行动。
        stay:                           停止动物的跟随状态。
        attack <某人>:                  让动物攻击敌人。
        stop <动物名>:                  让动物停止对人的攻击。
        release:                        结束主奴状态，将动物放离。

HELP );
	return 1;
}
