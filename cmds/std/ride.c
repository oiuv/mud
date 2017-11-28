// ride.c

#include <ansi.h>

inherit F_CLEAN_UP;

int do_ride(object me, object ob);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object obj, env;

	if (! arg) return notify_fail("你要骑什么东西？\n");

	if (me->query_temp("is_riding"))
		return notify_fail("你已经有座骑了！\n");

	if (me->is_busy())
		return notify_fail("你上一个动作还没有完成！\n");

	if (me->is_fighting())
                return notify_fail("你还在战斗中！没空骑上去。\n");

	// Check if a container is specified.
	env = environment(me);

	if (! objectp(obj = present(arg, env)) || !living(obj))
                return notify_fail("这里没有这样东西可骑。\n");

	if (! obj->query("ridable"))
		return notify_fail("这个东西你也要骑？当心你的屁股！\n");

	return do_ride(me, obj);
	write("骑上去了。\n");
}
	
int do_ride(object me, object obj)
{
	object *guard;

	if( !obj ) return 0;

	if( guard = obj->query_temp("guarded") ) {
		guard = filter_array(guard, (: objectp($1) && present($1, environment($2)) && living($1) && ($1!=$2) :), me);
		if( sizeof(guard) )
			return notify_fail( guard[0]->name() 
				+ "正守在" + obj->name() + "一旁，防止任何人骑走。\n");
	}

	obj->set_weight(1);
	if( obj->move(me) )
	{
		message_vision( "$N飞身跃上$n，身手很是矫捷。\n", me, obj );
		obj->set_temp("is_rided_by", me);
		me->set_temp("is_riding", obj);
	}
	else
	{
		message_vision( "$N身上带的东西太重了，无法骑到$n身上去。\n", me, obj );
	}
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : ride | qi <生物名>
 
这个指令可以让你骑上代步的已驯养的动物。
 
HELP
    );
    return 1;
}
