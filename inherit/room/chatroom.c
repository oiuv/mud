// chat room
// by Doing

#include <room.h>
#include <ansi.h>
#include <command.h>

inherit ROOM;

int is_chat_room() { return 1; }
int do_help(string arg);

string look_board();
int do_ban(string arg);
int do_invite(string arg);

void setup()
{
        set("channel_id", "聊天精灵");
        ::setup();
}

void create()
{
	set("short", "聊天室");
	set("long", @DESC
这里什么也没有。
DESC );
	set("no_fight", 1);
        set("no_sleep_room",1);
	set("item_desc", ([
		"chalkboard" : (: look_board :),
	]));

	setup();
}

void init_room(object out_room, object me)
{
        object board;

        set("owner_id", me->query("id"));
        set("startroom", base_name(out_room));
        set("short", me->name(1) + "(" + me->query("id") + ")的聊天室");
        set("long", sort_string("这里是" + me->name(1) + "为大家提供的聊"
                                "天室，中间几个桌凳，上面零零散散的摆着茶"
                                "水和烟灰缸，地上则是一地的瓜子皮和烟头，"
                                "除此之外空空荡荡的什么也没有。在门口歪歪"
                                "斜斜的放着一个黑板(chalkboard)，上面写着"
                                "几行字。\n", 64, 4));
        set("exits/out", base_name(out_room));

        if (me->query("env/auto_ban"))
                do_ban(me->query("env/auto_ban"));

        if (me->query("env/auto_invite"))
                do_invite(me->query("env/auto_invite"));

        CHANNEL_D->do_channel(out_room, "sys",
                              sprintf("%s(%s)在%s建立了一个聊天室。",
                                      me->name(1), me->query("id"),
                                      out_room->short()));
        if (me->query_skill("idle-force", 1) >= 300)
        {
                board = new("/clone/board/chatroom_b");
                board->set_from_me(me, this_object());
        }
}

private string look_board()
{
        string topic;

        if (! stringp(topic = query("topic")))
                return "海阔凭鱼跃，天高任鸟飞 - 畅所欲言。\n";

        return "今天的话题是：" + topic + "\n";
}

int is_owner(object me)
{
        if (me->query("id") == query("owner_id") ||
            me->query("couple/id") == query("owner_id"))
                return 1;

        return notify_fail("你不是这个聊天室的主人，没有发话的权利。\n");
}

int welcome(object me)
{
        string *ban;
        string *can;

        if (is_owner(me))
                return 1;

        if (query("ban_all"))
        {
                if (! arrayp(can = query("can")))
                        return notify_fail("现在主人不允许任何人进入这个聊天室。\n");

                if (member_array(me->query("id"), can) == -1)
                        return notify_fail("你现在不能进入这个聊天室。\n");
                return 1;
        }

        if (! arrayp(ban = query("ban")))
                return 1;

        if (member_array(me->query("id"), ban) != -1)
                return notify_fail("你现在不能进入这个聊天室。\n");

        return 1;
}

int invisible_for(object me)
{
	if (! query("secret") ||
	    welcome(me))
		return 0;

	return 1;
}

int do_ban(string arg)
{
        object me;
        string *ban;
        string *can;
        string msg;
        string *all;
        int i;

        me = this_player();
        if (! is_owner(me) || arg && ! stringp(arg))
                return 0;

        if (! arrayp(ban = query("ban"))) ban = ({ });
        if (! arrayp(can = query("can"))) can = ({ });

        if (! arg)
        {
                if (query("ban_all"))
                {
                        write("你现在拒绝所有没有经过邀请的人进入聊天室。\n");
                        return 1;
                }

                if (! sizeof(ban))
                {
                        write("你现在并没有拒绝任何人进入聊天室。\n");
                        return 1;
                }

                msg = "你的黑名单：\n" HIR;
                for (i = 0; i < sizeof(ban); i++)
                {
                        msg += sprintf("%12-s", ban[i]);
                        if (! ((i + 1) % 4)) msg += "\n";
                }

                if (i % 4) msg += "\n";
                msg += NOR;
                write(msg);
                return 1;
        }

        if (arg == "all" || arg == "ALL" || arg == "-all" || arg == "-ALL")
        {
                if (! query("ban_all"))
                {
                        write("现在开始你将拒绝那些没有经过邀"
                              "请的人进入聊天室。\n");
                        set("ban_all", 1);
                } else
                        write("你刚才已经拒绝那些没有经过邀请"
                              "的人进入聊天室了。\n");
                return 1;
        }

        if (member_array(arg, ban) != -1)
        {
                write("此人现在已经被设定为拒绝入内的人士了。\n");
                return 1;
        }

        if (arg == me->query("id"))
        {
                write("拒绝你自己入内？你是不是大脑有问题？\n");
                return 1;
        }

        if (arg == query("owner_id"))
        {
                write("连屋主你也想关在外面？看来你是有点问题了。\n");
        }

        all = explode(arg, ",") - ({ "", query("owner") }) - ban;
        if (! sizeof(all))
        {
                write("这些人现在已经被设定为邀请入内的人士了。\n");
                return 1;
        }
        if (sizeof(ban) > 50)
        {
                write("够了，你已经指定太多的人了，还不如干脆"
                      "许可所有的人(invite all)入内好了。\n");
                return 1;
        }

        ban += all;
        can -= all;
        arg = implode(all, ",");
        write("你将(" + arg + ")打入了黑名单，从现在开始拒绝其入内。\n");
        set("ban", ban);
        set("can", can);
        return 1;
}

int do_invite(string arg)
{
        object me;
        object ob;
        string *ban;
        string *can;
        string msg;
        string *all;
        int i;

        me = this_player();
        if (! is_owner(me) || arg && ! stringp(arg))
                return 0;

        if (! arrayp(ban = query("ban"))) ban = ({ });
        if (! arrayp(can = query("can"))) can = ({ });

        if (! arg)
        {
                if (! query("ban_all"))
                {
                        write("你现在同意任何没有被拒绝的人进入聊天室。\n");
                        return 1;
                }

                if (! sizeof(can))
                {
                        write("你现在并没有特别邀请任何人进入聊天室。\n");
                        return 1;
                }

                msg = "以下这些人是你特地关照要请进来的：\n" HIC;
                for (i = 0; i < sizeof(can); i++)
                {
                        msg += sprintf("%12-s", can[i]);
                        if (! ((i + 1) % 4)) msg += "\n";
                }

                if (i % 4) msg += "\n";
                msg += NOR;
                write(msg);
                return 1;
        }

        if (arg == "all" || arg == "ALL" || arg == "-all" || arg == "-ALL")
        {
                if (query("ban_all"))
                {
                        write("现在开始你同意让所有没有被打入"
                              "黑名单的人都能进入聊天室。\n");
                        delete("ban_all");
                } else
                        write("你已经同意让所有没有被打入黑名"
                              "单的人都能进入聊天室了。\n");
                return 1;
        }

        if (member_array(arg, can) != -1)
        {
                write("此人现在已经被设定为邀请入内的人士了。\n");
                return 1;
        }

        if (arg == me->query("id"))
        {
                write("邀请你自己？看来是没有这个必要。\n");
                return 1;
        }

        if (arg == query("owner_id"))
        {
                write("邀请屋主么？似乎多此一举了。\n");
        }

        all = explode(arg, ",") - ({ "", query("owner") }) - can;
        if (! sizeof(all))
        {
                write("这些人现在已经被设定为邀请入内的人士了。\n");
                return 1;
        }

        if (sizeof(can) > 50)
        {
                write("够了，你已经指定太多的人了，还不如干脆"
                      "许可所有的人(invite all)入内好了。\n");
                return 1;
        }

        ban -= all;
        can += all;
        arg = implode(all, ",");
        write("你将(" + arg + ")列入邀请名单，从现在开始特别邀请他入内。\n");
        set("ban", ban);
        set("can", can);

        if (sizeof(all) == 1 &&
            objectp(ob = find_player(arg)) &&
            ! present(ob, this_object()))
                TELL_CMD->main(me, arg + " 来我的聊天室聊聊天吧！");
        return 1;
}

int do_kickout(string arg)
{
        object me;
        object ob;
//      int i;

        me = this_player();
        if (! is_owner(me))
                return 0;

        if (! arg)
                return notify_fail("你要把谁踢出去？\n");

        ob = present(arg, this_object());
        if (! ob)
                return notify_fail("这里没有这个人啊！\n");

        if (ob->query("id") == "men shen")
        {
                message_vision("$N把$n仔细的叠了起来收好。\n",
                               me, ob);
                destruct(ob);
                return 1;
        }

        if (! ob->is_character())
                return notify_fail("看清楚了，那可不是活人。\n");

        if (ob == me)
                return notify_fail("你大脑有水？\n");

        message_vision("$N飞起一脚，将$n咕噜咕噜的踢出门去！\n",
                       me, ob);
        ob->move(query("startroom"));
        ob->start_busy(3);
        message("vision", "只听“啪嗒”一声，" + ob->name() +
                "狼狈不堪的滚了出来，屁股上面还清清楚楚的留"
                "着一个鞋印。\n", environment(ob), ({ ob }));
        return 1;
}

int do_closechat()
{
        object me;
//      object ob;
        object *obs;
        int i;

        me = this_player();
        if (! is_owner(me))
                return 0;

        message_vision("$N站起来，伸了个懒腰，道：走吧走吧，该走了。\n", me);
        obs = filter_array(deep_inventory(this_object()), (: userp :));
        for (i = 0; i < sizeof(obs); i++)
        {
                message_vision("$N走了出去。\n", obs[i]);
                obs[i]->move(query("startroom"));
                if (living(obs[i]))
                        message("vision", obs[i]->name() + "从" + short() +
                                "里面走了出来。\n", environment(obs[i]), ({ obs[i] }));
                else
                        message("visoin", obs[i]->name() + "被人从" + short() +
                                "里面抬了出来。\n", environment(obs[i]), ({ obs[i] }));
        }
        CHANNEL_D->do_channel(this_object(), "sys",
                              sprintf("%s被%s(%s)拆除了。",
                                      short(),
                                      me->name(1), me->query("id")));
        destruct(this_object());
        return 1;
}

int do_summon(string arg)
{
        object ob;

        if (! is_owner(this_player()))
                return 0;

        if (arg != "menshen" && arg != "men shen")
                return notify_fail("你要召唤什么？\n");

        if (objectp(present("men shen", this_object())))
        {
                write("这里已经有门神为你把守了。\n");
                return 1;
        }

        if (this_player()->query_skill("idle-force", 1) < 100)
        {
                write("你的发呆神功水平有限，还无法发呆出一个门神来。\n");
                return 1;
        }

        ob = new("/clone/gift/menshen");
        message_vision("$N忽然不说话了，发了一会儿呆，过了一"
                       "阵，突然天上掉下一张年画，\n上面画着"
                       "一个威武雄壮的门神。$N把它拣了起来，"
                       "贴在门上面。\n", this_player());
        ob->move(this_object());
        return 1;
}

int do_secret(string arg)
{
	object me;

	if (! arg)
	{
		write("现在聊天室" + (query("secret") ? "处于秘密状态。\n"
						      : "处于公开状态。\n"));
		return 1;
	}

	me = this_player();
        if (! is_owner(me))
                return 0;

	if (arg == "on" || arg == "ON" || arg == "+")
	{
		if (query("secret"))
		{
			write("现在聊天室已经是秘密的了。\n");
			return 1;
		}

		message_vision("$N神神秘秘的看了看四周，把手指竖在"
			       "唇前，小声道：“吁”。\n", me);
		set("secret", 1);
		message("vision", HIG "现在聊天室已经是秘密的了。\n" NOR,
			all_inventory());
	} else
	if (arg == "off" || arg == "OFF" || arg == "-")
	{
		if (! query("secret"))
		{
			write("现在聊天室并不是秘密的。\n");
			return 1;
		}

		message_vision("$N鬼鬼祟祟的看了看四周，道：“大家是不"
			       "是都说完悄悄话了？”\n", me);
		delete("secret");
		message("vision", HIC "现在聊天室已经是公开的了。\n" NOR,
			all_inventory());
	} else
		do_help("secret");

	return 1;
}

int do_topic(string arg)
{
        object me;
//      object ob;

        me = this_player();
        if (! is_owner(me))
                return 0;

        if (! arg)
        {
                if (query("topic"))
                        write("目前的话题是：" + query("topic") + "。\n");
                else
                        write("目前没有限制什么话题。\n");
                write("你打算指定什么新话题？\n");
                return 1;
        }

        if (arg == "none")
        {
                delete("topic");
                message_vision("$N道：大家随便聊聊吧，不必拘泥于某个话题。\n", me);
                return 1;
        }

        set("topic", arg);
        message_vision("$N道：咱们今天不如谈谈『" + arg + "』这个话题。\n"
                       "说完从地上找到一根粉笔在黑板上胡乱涂了几行字。\n", me);
        return 1;
}

int do_help(string arg)
{
        switch (arg)
        {
        case "here":
                write(@HELP
在这里你可以使用以下这些和聊天室相关的命令：
    ban          禁止某些人访问聊天室
    closechat    关闭这个聊天室(所有人都被踢出)
    invite       邀请某个人进入聊天室
    kickout      将某个人踢出聊天室
    summon       呼叫神灵
    look         看看聊天室里面都有谁
    out          离开聊天室
    topic        设置聊天室的话题
HELP );
                break;

        case "ban":
                write(@HELP_BAN
指令格式 : ban <玩家ID> [all]

此指令让你禁止指定的玩家进入你的聊天室。如果指明的参数是 all
则禁止所有的玩家进入，这时只有那些经过邀请的玩家才能进入。这
条指令不会影响此时已经在聊天室内的玩家。如果一次需要禁止多个
玩家，可以用逗号分开，比如：ban xxx,yyy,zzz。 在聊天室刚刚建
立好的时候会自动执行ban auto_ban，其中auto_ban是你设置的参数。

相关指令：kickout, invite
HELP_BAN );
                break;

        case "closechat":
                write(@HELP_CLOSECHAT
指令格式 : closechat

关闭这个聊天室。

HELP_CLOSECHAT );

        case "invite":
                write(@HELP_BAN
指令格式 : invite <玩家ID> [all]

此指令让你邀请指定的玩家进入你的聊天室。如果先前这个玩家被指
明禁止进入，这此时状态取消，同时如果玩家可以接收tell的话将会
收到你的邀请信息。如果指明的参数是 all则表明取消禁止所有的玩
家进入的限制，这是相对ban all 而言的。如果一次需要邀请多个玩
家，可以用逗号分开，比如：ban xxx,yyy,zzz。 在聊天室刚刚建立
好的时候会自动执行invite auto_invite， 其中auto_invite是你设
置的参数。

相关指令：kickout, ban
HELP_BAN );
                break;

        case "kickout":
                write(@HELP_BAN
指令格式 : invite <玩家ID>

踢出某一个捣乱的玩家，如果ID是men shen则把门神收起来。

相关指令：ban, invite
HELP_BAN );
                break;

        case "summon":
                write(@HELP_SUMMON
指令格式 : summon menshen

如果你有一百级的发呆神功，在你自己的聊天室里面就可以使用这条
命令呼叫门神帮你把守聊天室，自动踢出那些混进聊天室的人。
HELP_SUMMON );
                break;

        case "topic":
                write(@HELP_BAN
指令格式 : topic <任意信息> | <none>

指定一个聊天的话题。

HELP_BAN );
                break;

	case "secret":
		write(@HELP_SECRET
指令格式 : secret [+ | on | - | off]

使自己的聊天室成为秘密的聊天室，或者解除秘密状态。

HELP_SECRET );
                break;

        default:
                return notify_fail("你要查看什么帮助？\n");
        }

        return 1;
}

void add_all_action()
{
        // add all action for this_player()
        add_action("do_ban", "ban");
        add_action("do_closechat", "closechat");
        add_action("do_invite", "invite");
        add_action("do_kickout", "kickout");
        add_action("do_invite", "invite");
        add_action("do_topic", "topic");
        add_action("do_help", "help");
        add_action("do_secret", "secret");
        add_action("do_summon", "summon");
}

void init()
{
        add_all_action();
}

int clean_up()
{
	object *obs;

        // 聊天室里面有玩家、聊天魂魄、LV10兵器则不析构
	obs = filter_array(all_inventory(), (: userp($1) || playerp($1) || $1->is_chatter() ||
                                               $1->is_item_make() && $1->is_stay_in_room() :));
	if (! sizeof(obs))
	{
		destruct(this_object());
		return 0;
	}

	return 1;
}
