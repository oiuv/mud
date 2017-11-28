// save.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object link_ob;
        int lasttime;

	seteuid(getuid());

	if( !objectp(link_ob = me->query_temp("link_ob")) )
		return notify_fail("你不是经由正常连线进入，不能储存。\n");

        lasttime = time() - (int)me->query("last_save");
        if( lasttime >= 0 && lasttime < 30)
                return notify_fail("为了降低系统负载，请不要频繁储存进度。\n");

	if( environment(me)->query("valid_startroom") ) {
		me->set("startroom", base_name(environment(me)));
		write("当你下次连线进来时，会从这里开始。\n");
	}

	if( (int)link_ob->save() && (int)me->save() ) {
                write("档案储存完毕。\n");
                me->set("last_save", time());
		return 1;
	} else {
		write("储存失败。\n");
		return 0;
	}
}

int help(object me)
{
	write(@HELP
指令格式：save

把你辛苦奋斗的结果存起来。
HELP
	);
	return 1;
}
