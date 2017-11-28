// swear.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object ob;
        object old;
	string msg;

	if (! stringp(arg) || arg != "cancel" && sscanf(arg, "with %s", arg) != 1)
		return notify_fail("你要和谁一同结义？\n");

	if (me->is_busy() || me->is_fighting())
		return notify_fail("好好忙你手头的事情！\n");

	ob = present(arg, environment(me));

	if (objectp(old = me->query_temp("pending/swear")) &&
            (ob || arg == "cancel"))
	{
                if (old != ob)
                {
		        write("你打消了和" + old->name(1) + "结义的念头。\n");
        	        if (environment(old) == environment(me))
		                tell_object(old, me->name(1) + "打消了和你结义的念头。\n");
                } else
                if (old->query_temp("pending/answer/" + me->query("id"), 1))
                        return notify_fail("你正在向人家提出请求呢，可是人家还没有答应你。\n");

		me->delete_temp("pending/swear");
	        old->delete_temp("pending/answer/" + me->query("id"));
                if (arg == "cancel")
		        return 1;
	}

        if (! ob)
                return notify_fail("这里没有这个人。\n");

        if (me->query_temp("pending/answer/" + ob->query("id")) &&
            ob->query_temp("pending/swear") == me)
                return notify_fail("别人正在向你提议结拜呢，你究竟答应还是不答应？\n");


	if (! ob->is_character())
	{
		message_vision(CYN "$N" CYN "盯着$n" CYN "自言自语"
                               "道：“咱们…咱们结拜吧！求求你了！"
                               "”看来是疯了。\n" NOR, me, ob);
		return 1;
	}

        if (ob == me)
        {
                message_vision("$N目光呆滞，两眼发直，口中念念有词。\n", me);
                return 1;
        }

        if (me->query("age") < 18)
        {
                write("小毛孩子捣什么乱？一边玩去！\n");
                return 1;
        }

        if (ob->query("age") < 18)
        {
                write(ob->name() + "还是一个小毛孩子，你就省省吧，别逗人家了。\n");
                return 1;
        }

	if (! ob->query("can_speak"))
	{
		message_vision("$N望着$n傻笑的不停，不知道中了什么邪。\n", me, ob);
		return 1;
	}

        if (stringp(me->query("born_family") != "没有")
           && me->query("born_family") == ob->query("born_family"))
        {
                write("你和人家是同族弟子，结拜个什么？\n");
                return 1;
        }

        if (me->is_brother(ob))
        {
                write("你已经和他结义了，似乎没有必要再来一次吧。\n");
                return 1;
        }

        if (mapp(me->query("brothers")) && sizeof(me->query("brothers")) > 12)
        {
                write("你结义的兄弟也太多了，连你自己都快记不清楚了。\n");
                return 1;
        }

	if (! living(ob))
	{
		write(ob->name() + "现在昏迷不醒，无法理会你的请求。\n");
		return 1;
	}

	me->start_busy(1);

        switch (random(6))
        {
        case 0:
	        msg = "$N对$n大声说道：「$R，你我一见如故，何不就此结义？」\n";
                break;
        case 1:
                msg = "$N叹道：「天下虽大，知音难觅，$nn，你我有缘，今日何不结"
                      "拜？」\n";
                break;
        case 2:
                msg = "$N望着$n，喜不自胜道：「今日得遇$R，实乃三生有幸，你我"
                      "结拜可好？」\n";
                break;
        case 3:
                msg = "$N跨上一步，大声道：「千金易得，良友难觅，$nn！你我何不"
                      "就此结拜？」\n";
                break;
        case 4:
                msg = "$N道：「$nn！在下有意和你结为异姓骨肉，你看可好？」\n";
                break;
        default:
                msg = "$N拉着$n的手，郑重道：「今日良辰，你我在此相逢，当真难"
                      "得，不如结拜可好？」\n";
                break;
        }

        msg = replace_string(msg, "$nn", ob->name(1));
        msg = replace_string(msg, "$R", RANK_D->query_respect(ob));
        message_vision(HIW + msg + NOR, me, ob);

	if (! userp(ob))
	{
		write("但是" + ob->name() + "面露难色，看来是不感兴趣。\n");
		return 1;
	}

	tell_object(ob, YEL + me->name(1) + "请求和你结拜，你答应(right)还是不答应(refuse)？\n" NOR);
	ob->set_temp("pending/answer/" + me->query("id") + "/right",
                     bind((: call_other, __FILE__, "do_right", ob, me :), ob));
	ob->set_temp("pending/answer/" + me->query("id") + "/refuse",
	             bind((: call_other, __FILE__, "do_refuse", ob, me :), ob));
	me->set_temp("pending/swear", ob);

	return 1;
}

int do_right(object me, object ob)
{
        string msg;

	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

	if (ob->query_temp("pending/swear") != me)
		return notify_fail("人家现在已经不打算和你结拜了。\n");

        ob->delete_temp("pending/swear");

        if (me->is_brother(ob))
        {
                write("你已经和他结义了，似乎没有必要再来一次吧。\n");
                return 1;
        }

        if (mapp(me->query("brothers")) && sizeof(me->query("brothers")) > 12)
        {
                message_vision("$N为难的对$n道：“不是我不想...只是...”\n",
                               me, ob);
                write("你结义的兄弟也太多了，连你自己都快记不清楚了。\n");
                return 1;
        }

        message_vision(HIW "$N看着$n，连连点头道：「" +
                       RANK_D->query_self(me) + "正有此意！甚"
                       "好，甚好！」\n\n" HIC "只见$N与$n两人"
                       "齐齐跪下，撮土为香，一起磕头发誓。\n\n"
                       "      虽非骨肉\n      情同手足\n      "
                       "不是同年同月同日生\n      但求同年同月"
                       "同日死\n\n" NOR, me, ob);

        // 记录数据
        me->set("brothers/" + ob->query("id"), ob->name(1));
        ob->set("brothers/" + me->query("id"), me->name(1));
        me->save();
        ob->save();

        switch (random(3))
        {
        case 0:
                msg = "听说" + me->name(1) + "已和" +
                      ob->name(1) + "结为异姓骨肉，共闯江湖。";
                break;
        case 1:
                msg = "据说" + me->name(1) + "和" + ob->name(1) +
                      "一见如故，已经结为异姓骨肉。";
                break;
        default:
                msg = "听说" + me->name(1) + "与" + ob->name(1) +
                      "义结金兰，携手行走江湖。";
                break;
        }
	CHANNEL_D->do_channel(this_object(), "rumor", msg);
	return 1;
}

int do_refuse(object me, object ob)
{
        string msg;

	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

	if (ob->query_temp("pending/swear") != me)
		return notify_fail("人家现在已经不打算和你结拜了。\n");

        ob->delete_temp("pending/swear");

        switch (random(6))
        {
        case 0:
                msg = "$N嘿嘿干笑了几声，清了清嗓子，对$n道："
                      "「在下怎敢高攀？」\n";
                break;
        case 1:
                msg = "$N一皱眉，对$n道：「这……这似乎不太好"
                      "吧？还是改日再说吧！」\n";
                break;
        case 2:
                msg = "$N面有难色，道：「$nn，你的美意我心领了"
                      "，只是…只是……唉！不说也罢。」\n";
                break;
        case 3:
                msg = "$N叹了一口气道：「$nn，我只是觉得今日时"
                      "辰有些不美，谈及此事不太好，不太好啊！」\n";
                break;
        case 4:
                msg = "$N嗯了一声，忽然道：「你我辈分不合，这"
                      "个，这个我看还是算了吧。」\n";
                break;
        default:
                msg = "$N不看$n，只是顾左右而言它，看来是不"
                      "打算和$n结拜。\n";
                break;
        }

        msg = replace_string(msg, "$nn", ob->name(1));
        message_vision(CYN + msg + NOR, me, ob);
        tell_object(ob, "看来人家对你没什么兴趣。\n");

        return 1;
}

int help(object me)
{
   	write( @HELP
指令格式: swear cancel | with <someone>

和某人结义。

see also：brothers
HELP );
   	return 1;
}
