// prepare.c

inherit F_CLEAN_UP;

mapping valid_types = 
([
	"finger":   "指法",
	"hand":     "手法",
	"cuff":     "拳法",
	"claw":     "爪法",
	"strike":   "掌法",
	"unarmed":  "拳脚",
]);

int main(object me, string arg)
{
	mapping smap, pmap;
	string *skill, basic1, basic2, arg1, arg2, arg3;
        string msg;
	int i;

	seteuid(getuid());

	smap = me->query_skill_map();

	if (! mapp(smap) || sizeof(smap) == 0)
		return notify_fail("你现在没有使用任何有效特殊技能。\n");

	pmap = me->query_skill_prepare();
	if (! pmap) pmap = ([]);

	if (! arg)
	{
		if (! mapp(pmap) || sizeof(pmap) == 0)
			return notify_fail("你现在没有组合任何特殊拳术技能。\n");

		skill = keys(valid_types);
		msg = "以下是你目前组合中的特殊拳术技能。\n";
		for (i = 0; i < sizeof(skill); i++)
                {
			if (! me->query_skill(skill[i]) ||
			    ! pmap[skill[i]]) continue;
			msg += valid_types[skill[i]] + " (" + skill[i] + ")" +
			       "   " + to_chinese(pmap[skill[i]]) + "\n";
		}
                write(msg);
		return 1;
	}

	if (arg == "?") 
	{
		msg = "以下是可以使用特殊拳术技能的种类：\n";
		skill = sort_array(keys(valid_types), (: strcmp :));
		for(i = 0; i < sizeof(skill); i++)
			msg += sprintf("  %s (%s)\n", valid_types[skill[i]], skill[i]);
                write(msg);
		return 1;
	}

	if (arg == "none")
	{
		if (! mapp(pmap) || sizeof(pmap) == 0)
			return notify_fail("你现在没有组合任何特殊拳术技能。\n");

		skill = keys(pmap);
		for (i = 0; i < sizeof(skill); i++)
			me->prepare_skill(skill[i]);

		me->reset_action();
		write("取消全部技能准备。\n");
		return 1;
	}

	if (sizeof(pmap) >= 2)
		return notify_fail("你现在已经组合了两种特殊技能。\n");

        basic1 = 0;
        basic2 = 0;
	if (sscanf(arg, "%s %s %s", arg1, arg2, arg3) >= 3)
		return notify_fail("指令格式：prepare|bei [<技能名称一>|<技能名称二>]\n");

	if (sscanf(arg, "%s %s", arg1, arg2) == 2)
	{
		if (sizeof(pmap) == 1)
			return notify_fail("你已准备有一种技能了。\n");
		else
		{
                        if (me->query_skill_mapped(arg1))
                        {
                                basic1 = arg1;
                                arg1 = me->query_skill_mapped(arg1);
                        }

                        if (me->query_skill_mapped(arg2))
                        {
                                basic2 = arg2;
                                arg2 = me->query_skill_mapped(arg2);
                        }

			if (! me->query_skill(arg1, 1) || ! me->query_skill(arg2, 1))
				return notify_fail("你至少不会这两种技能其中之一。\n");

			if (! SKILL_D(arg1)->valid_combine(arg2))
				return notify_fail("这两种拳术技能不能组合。\n");

			skill = keys(valid_types);
			for (i = 0; i < sizeof(skill); i++)
                        {
                                if (! basic1 && smap[skill[i]] == arg1) basic1 = skill[i];
				if (! basic2 && smap[skill[i]] == arg2) basic2 = skill[i];
			}

			if (! basic1 || ! basic2)
				return notify_fail("这两种拳术尚未激发或目前不能准备。\n");

                        if (! valid_types[basic1])
                                return notify_fail(to_chinese(arg1) + "这种技能不需要准备。\n");

                        if (! valid_types[basic2])
                                return notify_fail(to_chinese(arg2) + "这种技能不需要准备。\n");

			me->prepare_skill(basic1, arg1);
			me->prepare_skill(basic2, arg2);

			me->reset_action();
			write("完成技能准备。\n");
			return 1;
		}		
	}

	if (sscanf(arg, "%s", arg1) == 1 && sizeof(pmap) <= 1)
	{
                if (me->query_skill_mapped(arg1))
                {
                        basic1 = arg1;
                        arg1 = me->query_skill_mapped(arg1);
                }

		if (! me->query_skill(arg1, 1))
			return notify_fail("你不会这种技能。\n");

		skill = keys(pmap);

		if (sizeof(pmap) == 1 &&
		   ! SKILL_D(arg1)->valid_combine(pmap[skill[0]]))
			return notify_fail("这种技能不能於你现有技能组合。\n");

		skill = keys(valid_types);
		for (i = 0; i < sizeof(skill); i++)
			if (! basic1 && smap[skill[i]] == arg1) basic1 = skill[i];

		if (! basic1)
			return notify_fail("这种技能尚未激发或目前不能准备。\n");

                if (! valid_types[basic1])
                        return notify_fail(to_chinese(arg1) + "这种技能不需要准备。\n");

		me->prepare_skill(basic1, arg1);
		me->reset_action();
		write("完成技能准备。\n");
	
		return 1;
	}
	
	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : prepare|bei [<拳术技能名称>|<拳术技能名称> | none]
           prepare|bei ?

这个指令让你指定所要用的拳术技能， 需指明一种以上的相应技能名称。
如果不加参数则会显示出技能种类及你目前所使用的技能名称 ，如果加一
个？会列出所有能使用特殊拳术技能的技能种类。
 
HELP );
        return 1;
}

