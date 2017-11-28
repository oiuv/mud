// reply.c

#include <ansi.h>
#include <net/dns.h>

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
	string st, target;
	object ob, obj, env;
        mixed info;

	if (! arg || arg == "")
		return notify_fail("你要回答什么？\n");

        env = environment(me);

        if (me->query_temp("quest_gift/npc"))
        {
                int gift, gongxian;
                string un;

                obj = me->query_temp("quest_gift/npc");
                obj = present(obj, env);

                gongxian = me->query_temp("quest_gift/gongxian");

                if (arg == "Y" || arg == "y" || arg == "yes")
                        gift = 2;

                if (arg == "N" || arg == "n" || arg == "no")
                        gift = 1;

                if (objectp(obj) && environment(obj) == env
                   && living(obj) && gift == 2)
                {
                        message_vision(CYN "\n$N" CYN "急忙点点头，说"
                                       "道：这东西正好我也需要，就交给"
                                       "我吧。\n" NOR, me);

                        if (me->query("gongxian") < gongxian)
                        {
                                message_vision(CYN "$N" CYN "突然一愣"
                                               "，说道：嗯？这个…你最"
                                               "近还不够努力…下次吧。"
                                               "\n" NOR, obj);
                                me->delete_temp("quest_gift");
                                return notify_fail(HIY "看来是你的门派"
                                                   "贡献值不够了。\n" NOR);
                        }

        	        ob = new(me->query_temp("quest_gift/obj"));

                        if (! ob)
                        {
                                message_vision(CYN "$N" CYN "纳闷道："
                                               "咦？我的东西呢？刚才还"
                                               "在，怎么突然就没了。\n"
                                               NOR, obj);
                                me->delete_temp("quest_gift");
                                return notify_fail("物品文件出现了问题"
                                                   "，请与巫师联系。\n");
                        }

                        if (ob->query("base_unit"))
                                un = ob->query("base_unit");
                        else
                                un = ob->query("unit");

                        me->add("gongxian", -gongxian);
                        me->delete_temp("quest_gift");

                        message_vision(CYN "$n" CYN "微微一笑，从怀中"
                                       "取出一" + un + ob->name() +
                                       CYN "交给$N" CYN "。\n" NOR,
                                       me, obj);
                        ob->move(me, 1);
                        return 1;
                } else
                if (objectp(obj) && environment(obj) == env
                   && living(obj) && gift == 1)
                {
                        message_vision(CYN "\n$N" CYN "颇为尴尬的说道："
                                       "嗯…我现在拿这东西也无用处，还"
                                       "是算了吧。\n" NOR, me);

                        message_vision(CYN "$n" CYN "对$N" CYN "叹气道"
                                       "：也罢，既然你不需要，这东西我"
                                       "就留给别人吧。\n" NOR, me, obj);

                        me->delete_temp("quest_gift");
                        return 1;
                }
        } else
                obj = 0;

	if (sscanf(arg, "%s %s", st, arg) == 2 &&
            ! objectp(obj = present(st, env)))
	{
		arg = st + " " + arg;
	}

        if (info = env->query("no_say"))
        {
                if (stringp(info))
                {
                        write(info);
                        return 1;
                }

                write("这个地方不能讲话。\n");
                return 1;
        }

	if (! stringp(target = me->query_temp("ask_you")))
		return notify_fail("刚才没有人向你询问。\n");

        if (me->ban_say(1))
                return 0;

        if (objectp(obj) && ! playerp(obj) && ! obj->is_chatter())
                obj = 0;

	if (! obj) obj = find_player(target); 
	if (! obj) obj = MESSAGE_D->find_user(target); 

	if (! obj)
		return notify_fail("刚才向你询问的人现在无法听见你，或"
                                   "者已经离开游戏了。\n");

        if (environment(obj) != environment(me))
                return notify_fail("刚才向你询问的人现在不再这里了。\n");

	message_vision(CYN "$N" CYN "回答$n" CYN
		       "：『" HIG + arg + NOR CYN "』\n" NOR, me, obj);

	if (userp(obj) || obj->is_chatter())
        {
                obj->set_temp("ask_you", me->query("id"));
                return 1;
        }

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式：answer [ <player> ] <讯息>

你可以用这个指令和刚才用 ask 和你说话的使用者说话，如果
指明了玩家则回答指定的玩家。

see also : tell
HELP
	);
	return 1;
}
