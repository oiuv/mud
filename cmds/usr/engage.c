// engage.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object witness;
	object ob;
        object old;
	string msg;

	seteuid(getuid());

	if (! arg)
		return notify_fail("你要向谁求婚？\n");

	if (me->is_busy() || me->is_fighting())
		return notify_fail("好好忙你手头的事情！\n");

	ob = present(arg, environment(me));

	if (objectp(old = me->query_temp("pending/engage")) &&
            (ob || arg == "cancel"))
	{
                if (old != ob)
                {
		        write("你打消了向" + old->name(1) + "求婚的念头。\n");
        	        if (environment(old) == environment(me))
		                tell_object(old, me->name(1) + "打消了向你求婚的念头。\n");
                } else
                if (old->query_temp("pending/answer/" + me->query("id"), 1))
                        return notify_fail("你正在向人家求婚呢。\n");

		me->delete_temp("pending/engage");
	        old->delete_temp("pending/answer/" + me->query("id"));
                if (arg == "cancel")
		        return 1;
	}

        if (! ob)
                return notify_fail("这里没有这个人。\n");

        if (me->query_temp("pending/answer/" + ob->query("id")) &&
            ob->query_temp("pending/engage") == me)
                return notify_fail("别人正在向你求婚呢，你究竟答应还是不答应？\n");


	if (! ob->is_character())
	{
		message_vision("$N痴痴的望着$n自言自语：嫁给"
			       "我吧...嫁给我吧...看来是疯了。\n", me, ob);
		return 1;
	}

        if (ob == me)
        {
                message_vision("$N目光呆滞，两眼发直。\n", me);
                return 1;
        }

        if (me->query("gender") == "女性" && ob->query("gender") == "女性" ||
            me->query("gender") != "女性" && ob->query("gender") != "女性")
        {
                write("你想和" + ob->name(1) + "结婚生理上似乎不太合适吧？\n");
                return 1;
        }

        if (me->query("class") == "bonze")
        {
		message_vision("$N对$n哼哼道：我也要结婚，我也要结婚！\n", me, ob);
		return 1;
        }

        if (ob->query("class") == "bonze")
        {
		message_vision("$N泪流满面的对$n道：你快还俗吧！我要和你结婚！\n", me, ob);
		return 1;
        }

	if (! ob->query("can_speak"))
	{
		message_vision("$N望着$n傻笑，一副变态的模样。\n", me, ob);
		return 1;
	}

        if (me->query("couple/id") == ob->query("id"))
                return notify_fail("你大脑进了水？\n");

	if (me->query("couple"))
		return notify_fail("你可要稳住！根据泥潭法典第九十九条，重婚者打入地狱！\n");

	if (ob->query("couple"))
		return notify_fail("你怎么也得等人家离婚了再说吧？\n");

	if (me->query("age") < 18)
	{
		message_vision("$N对$n大声喊道：我要快快长大，早早结婚！\n",
			       me, ob);
		return 1;
	}

	if (ob->query("age") < 18)
	{
		message_vision("$N对$n大声喊道：你要快快长大，我要等你结婚！\n",
			       me, ob);
		return 1;
	}

	me->start_busy(1);
        if (! objectp(witness = present("marriage witness", environment(me))))
        {
                if (me->query_temp("pending/engage_to") == ob->query("id"))
                {
                        CHANNEL_D->do_channel(this_object(), "rumor",
                                "据说" + me->name(1) + "下定决心，要和" +
                                ob->name(1) + "私定终身。");
                } else
                {
                        write("这里连个证婚人都没有？你想私定终身嘛？要"
                              "是这样就在输入一次这个命令。\n");
                        me->set_temp("pending/engage_to", ob->query("id"));
                        return 1;
                }
        } else
        {
                if (! living(witness))
                        return notify_fail("没看见" + witness->name() +
                                           "现在趴在地上呢么，你还是等一会儿吧。\n");

                if (witness->is_fighting())
                        return notify_fail(witness->name() + "现在正打架，" +
                                           "帮不上你的忙。\n");

                return witness->do_witness(me, ob);
        }

	msg = (me->query("gender") == "女性") ? "$N含情脉脉的对$n道：“你娶了我吧！”\n"
					      : "$N郑重其事的对$n道：“你嫁给我吧！”\n";

	message_vision(msg, me, ob);
	if (! living(ob))
	{
		write("然而" + ob->name() + "昏迷不醒，无法理会你的请求。\n");
		return 1;
	}

	if (! userp(ob))
	{
		write("但是" + ob->name() + "面露难色，看来是作不了主。\n");
		return 1;
	}

	tell_object(ob, YEL + me->name(1) + "在向你求婚呢，你答应(right)还是不答应(refuse)？\n" NOR);
	ob->set_temp("pending/answer/" + me->query("id") + "/right",
                     bind((: call_other, __FILE__, "do_right", ob, me :), ob));
	ob->set_temp("pending/answer/" + me->query("id") + "/refuse",
	             bind((: call_other, __FILE__, "do_refuse", ob, me :), ob));
	me->set_temp("pending/engage", ob);

	return 1;
}

int do_right(object me, object ob)
{
        object witness;

	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

	if (ob->query_temp("pending/engage") != me)
		return notify_fail("人家现在已经不打算向你求婚了。\n");

        ob->delete_temp("pending/engage");

	if (ob->query("couple"))
		return notify_fail("人家已经结婚了，你还是不要去趟混水了！\n");

	if (me->query("couple"))
		return notify_fail("你可要稳住！根据泥潭法典第九十九条，重婚者打入地狱！\n");

        if (me->query("class") == "bonze")
		return notify_fail("想结婚？还是先还俗吧！\n");

        if (ob->query("class") == "bonze")
		return notify_fail("想结婚？还是先等人家还俗吧！\n");

        if (witness = ob->query_temp("pending/marriage_witness"))
                return witness->do_right(me, ob);

	if (me->query("gender") == "女性")
        {
		switch (me->query("character"))
		{
		case "心狠手辣":
			message_vision("$N微微冷笑道：好吧，本"
                                       "小姐姑且就同意你吧。\n", me, ob);
			break;

		case "狡黠多变":
		        message_vision("$N羞答答的对$n道：好吧...\n", me, ob);
			break;

		case "光明磊落":
			message_vision("$N脆生生的对$n道：好吧！\n", me, ob);
			break;

		default:
			message_vision("$N望了望$n，嘻嘻笑道：好"
                                       "啊好啊，我最喜欢你了！\n", me, ob);
			break;
		}
	} else
        {
		switch (me->query("character"))
		{
		case "心狠手辣":
			message_vision("$N微微冷笑道：好吧，咱们就这样！",
                                       me, ob);
			break;

		case "狡黠多变":
		        message_vision("$N笑眯眯的对$n道：很好很好，我...我...\n", me, ob);
			break;

		case "光明磊落":
        		message_vision("$N意气风发的对$n道：好！\n", me, ob);
			break;

		default:
			message_vision("$N望了望$n，嘻嘻笑道：好"
                                       "啊好啊，我最喜欢你了！\n", me, ob);
			break;
		}
        }

	me->set("couple/id", ob->query("id"));
	me->set("couple/name", ob->name(1));
	me->save();
	ob->set("couple/id", me->query("id"));
	ob->set("couple/name", me->name(1));
        me->add("static/marry", 1);
        ob->add("static/marry", 1);
	ob->save();
	CHANNEL_D->do_channel(this_object(), "rumor",
			      "恭喜" + me->name(1) + "和" +
			      ob->name(1) + "私定终身，" +
			      (random(2) ? "终结连理。" : "比翼双飞。"));
	return 1;
}

int do_refuse(object me, object ob)
{
        object witness;

	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

	if (ob->query_temp("pending/engage") != me)
		return notify_fail("人家现在已经不打算向你求婚了。\n");

        ob->delete_temp("pending/engage");

	if (me->query("couple"))
	{
		message_vision("$N皱眉道：我已经结婚了，你的要求"
			       "我实在不能答应！\n", me, ob);
		return 1;
	}

        if (witness = ob->query_temp("pending/marriage_witness"))
                return witness->do_refuse(me, ob);

	if (me->query("gender") == "女性")
	{
		switch (me->query("character"))
		{
		case "心狠手辣":
			message_vision("$N横眉冷目对$n骂道：滚！癞"
                                "蛤蟆想吃天鹅肉？\n", me, ob);
			break;

		case "狡黠多变":
			message_vision("$N莞而一笑，对$n道：不要了，"
                                "我怎么看都不太合适，还是以后"
                                "再说吧！\n", me, ob);
			break;

		case "光明磊落":
			message_vision("$N干干脆脆的对$n道：我不同"
                                "意，你死了这条心吧！\n", me, ob);
			break;

		default:
			message_vision("$N望了望$n，冷笑道：要好，"
                                "拿出两百万两黄金作聘礼，外加"
                                "三千颗菩提子再说吧！\n", me, ob);
			break;
		}
	} else
	{
		switch (me->query("character"))
		{
		case "心狠手辣":
			message_vision("$N横眉冷目对$n骂道：滚！你"
                                "这臭婆娘！\n", me, ob);
			break;

		case "狡黠多变":
			message_vision("$N眼珠转了几转，对$n道：何必"
                                "着急？这事儿咱们以后再说。\n", me, ob);
			break;

		case "光明磊落":
			message_vision("$N摇摇头，对$n道：我这人配不"
                                "上你，你还是另寻高就吧！\n", me, ob);
			break;

		default:
			message_vision("$N望了望$n，奸笑两声道：咱们"
                                "何必结婚呢？这样不也挺好的么？\n", me, ob);
			break;
		}
	}

        return 1;
}

int help(object me)
{
   	write( @HELP
指令格式: engage <someone>

向某人提出求婚，如果你是和尚或是尼姑，还是算了吧！

see also : divorce
HELP );
   	return 1;
}
