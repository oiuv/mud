// to.c

#include <command.h>

inherit F_CLEAN_UP;

int help(object me);

#define EXISTED         0x0001
#define NEED_OPP        0x0002
#define IS_STD_COMMAND  0x0004
#define IS_USR_COMMAND  0x0008
#define APPEND_CR       0x0010
#define NO_COST         0x0020
#define NO_SPACE	0x0040
#define LIMIT_LONG      0x0080          // limit to 128(chn char)

mapping valid_verb = ([
        "tell" : EXISTED | APPEND_CR | IS_STD_COMMAND | NEED_OPP,
        "reply": EXISTED | APPEND_CR | IS_STD_COMMAND,
        "say"  : EXISTED | APPEND_CR | IS_STD_COMMAND,
        "chat" : EXISTED | APPEND_CR,
        "wiz"  : EXISTED | APPEND_CR,
        "debug": EXISTED | APPEND_CR,
        "sys"  : EXISTED | APPEND_CR,
        "rumor": EXISTED | APPEND_CR,
        "sing" : EXISTED | APPEND_CR,
        "party": EXISTED | APPEND_CR,
        "shout": EXISTED | APPEND_CR,
        "describe" : EXISTED | IS_USR_COMMAND | NO_COST |
                     NO_SPACE | LIMIT_LONG,
]);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string verb, opp;

        if (! arg)
                return help(me);

        if (sscanf(arg, "%s %s", verb, opp) != 2)
        {
                verb = arg;
                opp = 0;
        }

        if (! valid_verb[verb])
                return notify_fail("对不起，不能使用这种方式发布信息。\n");

        if ((valid_verb[verb] & NEED_OPP) && ! opp)
                return notify_fail("你必须指明对象才能发出信息。\n");

        me->edit(bind((: call_other, __FILE__, "done", me, verb, opp :), me));
	return 1;
}

void done(object me, string verb, string opp, string msg)
{
        int m, n;
        int att;

        att = valid_verb[verb];
        if (att & APPEND_CR)
                msg = "\n" + msg;

        if (opp)
                msg = opp + " " + msg;

        n = strlen(msg);
        if (! wizardp(me) && ! (att & NO_SPACE))
		msg = replace_string(msg, "\n", "\n ");

        m = strlen(msg);
        if (m > 4096 || m > 256 && (att & LIMIT_LONG))
        {
                tell_object(me, "你弄得这么长干什么啊？\n");
                return;
        }

        n = strlen(msg) - n;
        if (att & NO_COST) n = 0;
        n *= 10;
        if (me->query("neili") >= n)
        {
                me->add("neili", -n);
        } else
        if (me->query("jing") >= n)
        {
                me->add("jing", -n);
        } else
        {
                tell_object(me, "你目前的内力和精不允许你这么做。\n");
                return;
        }

	// write prompt to show all the delay information
	me->write_prompt();
	me->clear_written();

        if (att & IS_STD_COMMAND)
        {
                if (! ("/cmds/std/" + verb)->main(me, msg))
                        write(query_fail_msg());
                return;
        }

        if (att & IS_USR_COMMAND)
        {
                if (! ("/cmds/usr/" + verb)->main(me, msg))
                        write(query_fail_msg());
                return;
        }

        CHANNEL_D->do_channel(me, verb, msg);
        return;
}

int help(object me)
{
	write(@HELP
指令格式： to say | tell | chat | rumor ... [sb]

这个指令让你发布信息的时候可以发布多行，但是使用耳语
(whisper)方式。 玩家发布的信息会在每行前面自动加上一
个空格。对于tell命令，必须指定对象。另外注意的是：一
次可以贴的行数受玩家内力和精的限制。
HELP );
	return 1;
}
