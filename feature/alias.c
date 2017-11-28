// alias.c
// From ES2
// Modified for XKX by Xiang (12/15/95)
// Updated by Doing

#include <ansi.h>
#include <dbase.h>
#include <name.h>
#include <message.h>
#include <shell.h>

#define MAX_ALIASES             40
mapping alias;

// 记录用户输入的信息变量
STATIC_VAR_TAG string *history, last_input, orginal_input;
STATIC_VAR_TAG int direct_command;

// 最后的输入命令(已经经过ALIAS处理)
string query_last_input() { return last_input; }

// 最后的输入原始字符串(已经经过命令确认：/或//打头)
string query_orginal_input() { return orginal_input; }

// 是否是控制命令(以/或//打头)
int is_direct_command() { return direct_command; }

string process_input(string str)
{
	string *args, cmd, argstr;
        object me;
	int i, j;
	
        me = this_object();
	notify_fail("什么？\n");
        clear_written();
        if (! living(me)) return "";

        // 记录最原始的输入
        if (str[0] == '/')
        {
                direct_command = 1;
                if (str[1] == '/') str = str[2..<1]; else
                                   str = str[1..<1];
        } else
                direct_command = 0;
        orginal_input = str;
	
        // attach system ?
        if (me->is_attach_system())
        {
                me->detach_system();
                tell_object(me, HIR "用户终止了当前执行的进程。\n" NOR);
        }

	if (str == "") return str;

        if (! wizardp(me))
        {
		if (me->reject_command())
                {
			int cq, cj;

                        // 晕倒以后要保证qi/jing不变
			cq = query("qi");
			cj = query("jing");

                        // 确保qi/jing不小于零，免得指令过多而冤死
                        if (cq < 1) cq = 0;
                        if (cj < 1) cj = 0;

                        // 我要保证清除最后打伤这个角色的人
                        set("jing", 0);
			me->receive_damage("jing", 0);

			message_vision(HIC "\n天空忽然传来了几声冷笑，"
                                       "霎时间乌云密布！一道" HIY "闪电"
				       HIC "从天而降！\n"
                                       NOR, me);
			me->unconcious();				

                        // 恢复晕倒前的qi/jing
			set("qi", cq);
			set("jing", cj);

                        // 确保有效的qi/jing不小于零，免得因
                        // 为指令过多而冤死。
                        if (query("eff_qi") < 1) set("eff_qi", 0);
                        if (query("eff_jing") < 1) set("eff_jing", 0);

                        message_vision(HIW "只见晕倒在地的$N"
                                       "身上冒着缕缕轻烟......\n\n" NOR, me);
			return "";
		}
	}

	if (mapp(alias))
        {
		if (! undefinedp(alias[str]))
			return replace_string(alias[str], "$*", "");

		if (sscanf(str, "%s %s", cmd, argstr) == 2 && ! undefinedp(alias[cmd]))
                {
			cmd = replace_string(alias[cmd], "$*", argstr);
			args = explode(argstr, " ");
			if ((j = sizeof(args)))
				for (i = 0; i < j; i++)
					cmd = replace_string(cmd, "$" + (i + 1), args[i]);
                        last_input = cmd;
			log_command(last_input);
			return cmd;
		}
	}

    if (wizardp(me) && stringp(str) && (str != "") &&
        me->query("env/use_shell"))
            str = parse_shell(str);
	last_input = (string)ALIAS_D->process_global_alias(str);
	log_command(last_input);
        return last_input;
}

int set_alias(string verb, string replace)
{
	if (! replace)
        {
		if (mapp(alias)) map_delete(alias, verb);
		return 1;
	} else
        {
		if (! mapp(alias)) alias = ([ verb : replace ]);
		else if (sizeof(alias) > MAX_ALIASES)
			return notify_fail("您设定的 alias 太多了，请先删掉一些不常用的。\n");
		else alias[verb] = replace;
		return 1;
	}
}

mapping query_all_alias()
{
	return alias;
}
