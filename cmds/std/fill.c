// drink.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
  mapping my;
	object ob;
  // function f;

	if (! arg)
                return notify_fail("你要往什么东西里面灌？\n");

	if (! environment(me)->query("resource/water"))
		return notify_fail("这里没有地方可以装水。\n");

	if (me->is_busy())
		return notify_fail("你上一个动作还没有完成。\n");

  if (me->is_fighting())
          return notify_fail("你正忙着打架，没工夫装水！\n");

	if (! objectp(ob = present(arg, me)))
                return notify_fail("你身上没有这样东西。\n");

  if (! mapp(my = ob->query("liquid")))
          return notify_fail("这个容器装不了水。\n");

	if (my["remaining"] && my["name"] != "清水")
		message_vision("$N将" + ob->name() + "里剩下的" +
			       my["name"] + "倒掉。\n", me);

	message_vision("$N将" + ob->name() + "装满清水。\n", me);

	my["type"] = "water";
	my["name"] = "清水";
	my["remaining"]  = ob->query("max_liquid");
	my["drink_func"] = 0;

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : fill <容器>

这个指令可以让有水的地方把容器灌满清水。

HELP
    );
    return 1;
}
