// tell.c

#include <ansi.h>
#include <net/dns.h>
#include <net/messaged.h>
#include <mudlib.h>

inherit F_DBASE;
inherit F_CLEAN_UP;

int notice_user(string my_name, string my_id, object obj, string tell_out);
int help(object me);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	string target, msg, mud;
        string my_id;
	object obj;
        string no_tell, can_tell;
        string tell_out;

	if (! arg || sscanf(arg, "%s %s", target, msg) != 2)
                return help(me);

	if (sscanf(target, "%s@%s", target, mud) == 2)
	{
		if (GTELL->send_gtell(mud, target, me, msg))
		{
			write("网路讯息已送出，可能要稍候才能得到回应。\n");
			return 1;
		}
	}

	obj = find_player(target);
	if (! obj || ! me->visible(obj))
	{
		if (MESSAGE_D->send_msg_to(me, target, msg))
			return 1;
		return notify_fail("这个用户没有登录，你无法和他交谈。\n");
	}

        my_id = me->query("id");
        no_tell = obj->query("env/no_tell");
	if (! wizardp(me) && (no_tell == "all" || no_tell == "ALL" ||
	    is_sub(my_id, no_tell)))
        {
                can_tell = obj->query("env/can_tell");
                if (! is_sub(my_id, can_tell))
		        return notify_fail("这个人不想听你罗嗦啦。\n");
        }

	if (! interactive(obj) || obj->is_net_dead())
		return notify_fail("此人现在不在线上，听不到你的话。\n");

	if (! living(obj))
		return notify_fail("这人现在恐怕听不到你说的话了...\n");

        if (me->ban_say(1))
                return 0;

        if (obj == me)
        {
                message_vision("$N喃喃自语。\n", me);
                return 1;
        }

        tell_out = sprintf(HIG "%s告诉你：%s\n" NOR,
		           me->name(1) + HIG + "(" +
                           capitalize(my_id) + ")", msg);
        if (! notice_user(me->name(1), my_id, obj, tell_out))
                return 1;

	write(sprintf(HIG "你告诉%s(%s)：%s\n" NOR,
                      obj->name(1) + HIG,
                      capitalize(obj->query("id")), msg));

        if (query_idle(obj) >= 120)
                write(YEL "可是" + obj->name(1) +
                      YEL "已经在猪圈中发呆有" + chinese_number(query_idle(obj) / 60) +
                      "分钟了，恐怕没法立刻回答你。\n");

	return 1;
}

string remote_tell(string cname, string from, string mud, string to, string msg, int wiz_level)
{
	object ob;
	string fromid;
	string no_tell;
	string can_tell;
//      mapping conn;
//      string reject;
        string tell_out;

	if (ob = MESSAGE_D->find_user(to))
        {
		if (ob->query("env/invisible"))
			return "这个人现在不在线上。";

		fromid = lower_case(from + "@" + mud);
		no_tell = ob->query("env/no_tell");
		if ((! intp(wiz_level) || wiz_level < 3) &&
                    (no_tell == "all" || no_tell == "ALL" ||
	             is_sub(fromid, no_tell)))
        	{
                	can_tell = ob->query("env/can_tell");
                	if (! is_sub(fromid, can_tell))
		        	return "这个人不想听你罗嗦啦。";
        	}

		fromid = capitalize(from) + "@" + upper_case(mud);
		msg = replace_string(msg, "\n", "");
		if (cname)
                        tell_out = sprintf(HIG "%s(%s)告诉你：%s\n" NOR,
                                           cname, fromid, msg);
		else
                {
                        cname = "未知";
			tell_out = sprintf(HIG "%s 告诉你：%s\n" NOR,
				           fromid, msg);
                }

                to = capitalize(to);
                if (! notice_user(cname, fromid, ob, tell_out))
                        msg = sprintf(HIG "你的话没有送到%s(%s@%s)的耳边。\n" NOR,
                                      ob->name(1), to, upper_case(INTERMUD_MUD_NAME));
                else
		        msg = sprintf(HIG "你告诉%s(%s@%s)：%s" NOR, ob->name(1), to,
			              upper_case(INTERMUD_MUD_NAME), msg);
                return msg;

	} else
		return "这个人现在不在线上。";
}

// 将消息送给对方
int notice_user(string my_name, string my_id, object obj, string tell_out)
{
        int i;
        mixed info;
        mixed *list;
        mixed piece;

        if (obj->query("env/jam_talk"))
        {
                // 阻塞式交谈
                info = ({ my_name, my_id, tell_out });
                list = obj->query_temp("tell_list");
                if (! arrayp(list) || sizeof(list) < 1)
                {
                        // 对方没有阻塞消息，直接通知对方
                        tell_object(obj, tell_out);
                        obj->set_temp("reply", my_id);
                        list = ({ info });
                } else
                if (arrayp(list[0]) && sizeof(list[0]) >= 3 &&
                    list[0][1] == my_id)
                {
                        // 对方阻塞的正是和我交谈的信息，所以
                        // 这条信息就没有必要延迟发送了
                        tell_object(obj, tell_out);
                } else
                {
                        // 遍历所有的历史信息，查看是否已经有
                        // 交谈的记录了
                        for (i = 1; i < sizeof(list); i++)
                        {
                                piece = list[i];
                                if (! arrayp(piece) || sizeof(piece) < 3 ||
                                    ! stringp(piece[2]))
                                {
                                        // 这条历史记录不合法
                                        list[i] = 0;
                                        continue;
                                }

                                if (piece[1] == my_id)
                                {
                                        // 找到了和对方以前交谈的信息
                                        if (strlen(piece[2]) > 32768)
                                        {
                                                // 历史信息已经过了32K了
                                                write("你已经说了好多话了，先等别人听完吧。\n");        
                                                return 0;
                                        }

                                        // 记录这次交谈的信息
                                        piece[2] += tell_out;
                                        info = 0;
                                }
                        }
                        list -= ({ 0 });

                        // 这个人还有没有听完的话呢
                        if (arrayp(info))
                        {
                                if (sizeof(list) > 12)
                                {
                                        write(obj->name(1) + "耳边已经有太多"
                                              "的话了，你还是等会儿再说吧。\n");
                                        return 0;
                                }

                                // 记录这句话
                                list += ({ info });
                                if (! in_input(obj))
                                        obj->write_prompt();
                        }
                }
                obj->set_temp("tell_list", list);
        } else
        {
                // 正常聊天
                obj->set_temp("reply", my_id);
                tell_object(obj, tell_out);
        }

        return 1;
}

int help(object me)
{
	write(@HELP
指令格式：tell <某人> <讯息>

你可以用这个指令和其他地方的使用者说话。如果对方选择阻塞式交
谈，那么他可能不会立刻听到你说的话。

其他相关指令：reply、skip
HELP );
	return 1;
}