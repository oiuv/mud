// goto.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	int goto_inventory = 0;
	object obj;
        object env;
	string msg;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg) return notify_fail("你要去什么地方？\n");

	if (sscanf(arg, "-i %s", arg)) goto_inventory = 1;

	if (! arg) return notify_fail("你要去哪里？\n");

	obj = find_player(arg);
	if (! obj) obj = MESSAGE_D->find_user(arg);
	if (! obj) obj = find_living(arg);
	if (! obj || ! me->visible(obj))
	{
		arg = resolve_path(me->query("cwd"), arg);
		if (! sscanf(arg, "%*s.c") ) arg += ".c";
		if (! (obj = find_object(arg)))
		{
			if (file_size(arg)>=0)
				return me->move(arg);
			return notify_fail("没有这个玩家、生物、或地方。\n");
		}
	}

	if (! goto_inventory)
        {
                if (environment(obj))
		        obj = environment(obj);
                else
                {
                        if (obj->is_character())
                                // unless you goto a inventory, or you
                                // can not enter a character
                                obj = 0;
                }
        }

	if (! obj) return notify_fail("这个物件没有环境可以 goto。\n");

        if ((env = environment(me)) == obj)
                return notify_fail("你在原地乱蹦什么？\n");

        if (obj == me)
                return notify_fail("好厉害！你想钻到自己身体里面？\n");

        if (me->query("gender") == "女性" )
                tell_object(me, HIG "你化作清风而去。\n" NOR);
        else
                tell_object(me, HIY "你化作长虹而去。\n" NOR);
                
	if (env && ! me->query("env/invisible"))
	{
        	if (! stringp(msg = me->query("env/msg_mout")))
                        msg = "只见一阵烟雾过後，$N的身影已经不见了。";

                msg = replace_string(msg, "$N", me->name() + HIM);
               	message("vision", HIM + msg + "\n" NOR, env, ({ me, env }));
        }

        me->set_magic_move();
        if (! me->move(obj))
        {
                msg = HIM "你的遁术失败了。\n" NOR;
                tell_object(me, msg);
                message("vision", HIM "突然" + me->name() + "一个跟头"
                                  "摔倒在地上。\n" NOR, obj, ({ me }));
                return 1;
        }
        else
                msg = HIM "你到了地方，落下遁光，收住身形。\n" NOR;

	if (environment(me) != obj)
		return 1;

        tell_object(me, msg);

	if (! me->query("env/invisible"))
	{
		if (! stringp(msg = me->query("env/msg_min")))
			msg = "$N的身影突然出现在一阵烟雾之中。";
                msg = replace_string(msg, "$N", me->name());
               	message("vision", HIM + msg + "\n" NOR, obj, ({ me, obj }));
	}

	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : goto [-i] <目标>
 
这个指令会将你传送到指定的目标. 目标可以是一个living 或房间
的档名. 如果目标是living , 你会被移到跟那个人同样的环境.
如果有加上 -i 参数且目标是 living, 则你会被移到该 living 的
的 inventory 中.
 
HELP );
        return 1;
}
