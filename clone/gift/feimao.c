// feimao.c 飞毛腿导弹

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(WHT "飞毛腿导弹" NOR, ({ "missile" }));
	set_weight(20000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "这是一枚中程飞弹，价格便宜，"
                            "适用于发展中人士购买。\n");
                set("value", 10000);
                set("no_sell", 1);
                set("unit", "枚");
	}
}

void init()
{
        add_action("do_launch", "launch");
        add_action("do_aim", "aim");
}

int do_launch(string arg)
{
        object me;
        object ob;
        string user;

        me = this_player();

        if (me->is_busy())
                return notify_fail("什么事情都等你忙完了再说。\n");

        if (me->is_fighting())
                return notify_fail("打完架再考虑这些事情吧！\n");

        if (! arg || ! id(arg))
                return notify_fail("你要发射什么？\n");

        if (! stringp(user = query_temp("aim")))
                return notify_fail("你先瞄准(aim)好再发射！\n");

        if (! objectp(ob = find_player(user)) ||
	    ! me->visible(ob))
                return notify_fail("你要炸的玩家现在好像不在线上。\n");

        message_vision(HIM "$N掏出一个" + name() + HIM "，喝道："
                       "“飞毛腿准备发射！”说罢一按开关！\n"
                       "就听“轰”的一声，" + name() + HIM "拍拍屁股不见了！\n" NOR, me);

        message_vision(HIC "突然天空传来一阵呼啸的声音...\n" +
                       "“轰”的一声，$N" HIC "被炸得飞起数米，跌倒在地，"
                       "一句话都说不出来...\n" NOR, ob);

        if (wizardp(ob))
                message_vision(HIM "$N" HIM "连忙点燃一张符纸，口中"
                       "直念叨：“太上老君救命啊...”\n" NOR, ob);
        else
        {
                message_vision(HIG "$N" HIG "一脸无辜的表情，真冤枉啊！\n" NOR, ob);
                ob->ban_say_until(60, "你现在被炸得头晕眼花，说不出话");
                CHANNEL_D->do_channel(this_object(), "rumor",
                                      "听说" + ob->name(1) +
                                      "不幸遭遇飞毛腿导弹袭击，现在精神失常。");
        }

        destruct(this_object());
        return 1;
}

int do_aim(string arg)
{
        object me;
        object ob;
        string my_id;

        if (arg && sscanf(arg, "%s with %s", arg, my_id) == 2 && ! id(my_id))
                return notify_fail("这里没有(" + my_id + ")这样东西。\n");

        if ((arg == "none" || arg == "cancel") && query_temp("aim"))
        {
                delete_temp("aim");
                write("立即取消飞弹瞄准！\n");
                return 1;
        }

        me = this_player();

        if (! arg || ! objectp(ob = find_player(arg)) ||
	    ! me->visible(ob))
                return notify_fail("你要瞄准哪个玩家？\n");

        if (me->is_busy())
                return notify_fail("什么事情都等你忙完了再说。\n");

        if (me->is_fighting())
                return notify_fail("打完架再考虑这些事情吧！\n");

        if (me->ban_say())
                return notify_fail("你现在说不出话来...导弹也没法发射。\n");

        tell_object(me, HIY "你掏出一个" + name() + HIY "，东瞄瞄，西瞄瞄。\n" NOR, me);
        message("vision", HIR "【观察卫星】紧急报告，" + ob->name(1) +
                          HIR "已经被人用" + name() +
                          HIR "瞄准了。\n" NOR, ob);

        set_temp("aim", ob->query("id"));
        me->start_busy(2);

        return 1;
}

string long()
{
        object ob;
        string msg;

        msg = query("long");
        if (query_temp("aim") &&
            objectp(ob = find_player(query_temp("aim"))))
        {
                msg += "现在这枚飞弹正瞄准着" + ob->name(1) +
                       "，待命发射(launch)。\n";
        } else
                msg += "现在这枚飞弹正处于准备状态，"
                       "可以随时瞄准(aim)。\n";
        return msg;
}
