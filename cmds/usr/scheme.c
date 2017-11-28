// scheme.c

#include <ansi.h>

inherit F_CLEAN_UP;

private void done_input(object me, string text);
private void user_quit(object me);
int  continue_scheme(object me);
int  cancel_schedule(object me);

int main(object me, string arg)
{
        object ob;
        object env;
        string schedule;

        if (wizardp(me) && 0)
                return 0;

        seteuid(getuid());

	if (! arg)
	{
                if (! stringp(schedule = me->query("schedule")))
                {
                        write("你目前并没有制订任何计划。\n");
                        return 1;
                }

                write("你目前制订的计划如下：\n" + schedule);
                return 1;
	}

        if (sscanf(arg, "show %s", arg) == 1)
        {
                if (! wizardp(me))
                        return notify_fail("你无权查看他人制订的计划。\n");

                if (! objectp(ob = find_player(arg)))
                        return notify_fail("没有这个玩家。\n");

                if (! stringp(schedule = ob->query("schedule")))
                {
                        write("这个玩家没有制定计划。\n");
                        return 1;
                }

                write((ob == me ? "你" : (ob->name(1) + "(" + ob->query("id") + ")")) +
                      "现在制订的计划如下：\n" + schedule);
                if (ob->query("doing") == "scheme")
                        write("该计划目前正在执行中。\n");

                return 1;
        }

        if (arg == "clear")
        {
                if (me->query("doing") == "scheme")
                        return notify_fail("你现在正在执行计划，请先停下来再清除它。\n");

                me->delete("schedule");
                write("Ok.\n");
                return 1;
        }

        if (arg == "edit")
        {
                if (me->query("doing") == "scheme")
                        return notify_fail("你现在正在执行计划，请先停下来再修改。\n");

                write("请输入你将要执行的计划：\n");
                me->edit((: done_input, me :));
                return 1;
        }

        if (arg == "start")
        {
                if (! stringp(schedule = me->query("schedule")))
                        return notify_fail("你目前还没有制订计划。\n");

                if (me->query("doing"))
                        return notify_fail("你现在正在忙于锻炼，不能开展新计划。\n");

                env = environment(me);
                if (! env)
                        return notify_fail("你现在什么都做不了。\n");

                if (env->is_chat_room())
                        return notify_fail("你不能在聊天室里面执行计划。\n");

                if (! env->query("sleep_room"))
                        return notify_fail("你必须在能够休息的地方才能执行计划。\n");

                if (! env->query("no_fight"))
                        return notify_fail("你必须在安全的地方才能执行计划。\n");

                if (me->query("combat_exp") < 50000)
                        return notify_fail("你的实战经验太浅薄，还是先好好锻炼锻炼再说吧。\n");

                if (me->query("potential") - me->query("learned_points") < 100)
                        return notify_fail("你的潜能太少，难以开展计划。\n");

                if (sizeof(filter_array(all_inventory(env), (: playerp :))) > 12)
                        return notify_fail("这里的人实在太多了，你难以静心开展计划。\n");

                me->add("learned_points", 100);

                // 执行计划
                write("你开始执行计划。\n");
                me->set("startroom", base_name(env));
                CLOSE_D->user_closed(me);
                me->set_short_desc(0);
                continue_scheme(me);
                return 1;
        }

        return notify_fail("非法的命令参数。\n");
}

// 开始执行计划
int continue_scheme(object me)
{
        string schedule;
        string *scs;

        if (! stringp(schedule = me->query("schedule")))
                return 0;

        scs = explode(schedule, "\n");
        scs = filter_array(scs, (: replace_string($1, " ", "\n") != "" :));
        if (sizeof(scs) < 1)
        {
                write("这是一份空计划，你没什么好做的。\n");
                return 0;
        }

        me->set("doing", "scheme");
        me->set_temp("scs", scs);
        me->set_temp("scs_step", 0);
        me->delete_temp("scs_repeat");
        me->set_override("unconcious", (: call_other, __FILE__, "cancel_schedule" :));
        me->set_override("die", (: call_other, __FILE__, "cancel_schedule" :));
        return 1;
}

// 中止计划
int cancel_schedule(object me)
{
        me->delete_override("unconcious");
        me->delete_override("die");

        if (! me->query("schedule"))
                return 0;

        CLOSE_D->user_opened(me);

        if (! interactive(me))
                me->start_call_out((: call_other, __FILE__, "user_quit", me :), 0);

        return 0;
}

// 执行计划中
void execute_schedule(object me)
{
        mapping my, my_temp;
        string *scs;
        int scs_step;
        string *scs_repeat;
        string cmd, cmd_case;
        int i;
        int count;

        if (! objectp(me) || previous_object() != me)
                return;

        if (me->is_busy() || ! living(me))
                return;

        my = me->query_entire_dbase();
        my_temp = me->query_entire_temp_dbase();

        if (time() - (int)my_temp["scheme_last_fail"] < 5)
                return;

        if (my["food"] < 100 || my["water"] < 100)
        {
                write("你觉得肚子有点饿了，看来要找点吃的东西了。\n");
                if (MONEY_D->player_pay(me,  2000) != 1)
                {
                        write("你发现自己带的钱不够了，看来只好先去弄些钱了。\n");
                        cancel_schedule(me);
                        return;
                }
                write("你掏出一些钱，找了一位闲人让他帮你准备了一些食物。\n");

                // 补充食物和水
                my["food"]  = me->max_food_capacity();
                my["water"] = me->max_water_capacity();
                me->start_busy(10 + random(10));
                return;
        }

        if (! arrayp(scs = my_temp["scs"]))
        {
                if (! continue_scheme(me))
                        cancel_schedule(me);
                return;
        }

        scs_step = my_temp["scs_step"];
        if (scs_step < 0 || scs_step >= sizeof(scs))
                scs_step = 0;

        // 取第 n 步骤
        cmd = scs[scs_step];
        if (sscanf(cmd, "%s:%s", cmd, cmd_case) != 2)
                cmd_case = "IGNORE";

        // 显示准备执行的命令
        tell_object(me, me->prompt() + HIY + cmd + NOR "\n");

        switch (cmd)
        {
        case "REPEAT":
                // 开始循环
                count = 1;
                for (i = scs_step + 1; i < sizeof(scs); i++)
                {
                        if (scs[i] == "LOOP")
                        {
                                if (--count < 1)
                                break;
                        }
                        if (scs[i] == "REPEAT")
                                count++;
                }

                if (count > 0)
                {
                        write("计划中 repeat 没有找到与之匹配的 loop 命令，无法继续执行。\n");
                        cancel_schedule(me);
                        break;
                }

                if (! arrayp(my_temp["scs_repeat"]))
                        my_temp["scs_repeat"]  = ({ ({ scs_step, i }) });
                else
                if (sizeof(my_temp["scs_repeat"]) < 12)
                        my_temp["scs_repeat"] += ({ ({ scs_step, i }) });
                else
                {
                        write("循环嵌套的层次太多，你的计划书好复杂，执行不了。\n");
                        cancel_schedule(me);
                        break;
                }

                write("开始循环.\n");
                break;

        case "LOOP":
                // 循环执行
                if (! arrayp(scs_repeat = my_temp["scs_repeat"]) ||
                    sizeof(scs_repeat) < 1)
                {
                        write("没有找到计划中与之匹配的 repeat 命令。\n");
                        cancel_schedule(me);
                        return;
                }

                scs_step = scs_repeat[sizeof(scs_repeat) - 1][0];
                write("Loop.\n");
                break;

        case "BREAK":
                // 跳出该循环
                if (! arrayp(scs_repeat = my_temp["scs_repeat"]) ||
                    sizeof(scs_repeat) < 1)
                {
                        write("没有找到计划中与之匹配的 repeat-loop 命令。\n");
                        cancel_schedule(me);
                        return;
                }

                scs_step = scs_repeat[sizeof(scs_repeat) - 1][1];
                my_temp["scs_repeat"] = scs_repeat[0..<2];
                write("Ok.\n");
                break;

        default:
                // 执行第 n 步，并视情况看下一步是否执行第二操作
                if (! me->force_me(cmd))
                {
                        // 执行失败时的命令
                        if (cmd_case != "IGNORE")
                                tell_object(me, me->prompt() + HIY + cmd_case + NOR "\n");

                        switch (cmd_case)
                        {
                        case "RETRY":
                                my_temp["scheme_last_fail"] = time();
                                return;

                        case "CONTINUE":
                                // 循环执行
                                if (! arrayp(scs_repeat = my_temp["scs_repeat"]) ||
                                    sizeof(scs_repeat) < 1)
                                {
                                        write("没有找到计划中与之匹配的 repeat 命令。\n");
                                        cancel_schedule(me);
                                        break;
                                }

                                scs_step = scs_repeat[sizeof(scs_repeat) - 1][0];
                                write("Loop.\n");
                                break;

                        case "BREAK":
                                // 跳出该循环
                                if (! arrayp(scs_repeat = my_temp["scs_repeat"]) ||
                                    sizeof(scs_repeat) < 1)
                                {
                                        write("没有找到计划中与之匹配的 repeat-loop 命令。\n");
                                        cancel_schedule(me);
                                        break;
                                }

                                scs_step = scs_repeat[sizeof(scs_repeat) - 1][1];
                                my_temp["scs_repeat"] = scs_repeat[0..<2];
                                write("Ok.\n");
                                break;

                        case "IGNORE":
                                // 执行命令忽略失败情况
                                break;

                        default:
                                me->force_me(cmd_case);
                                break;
                        }
                        // 命令失败时执行 cmd_case 完毕。
                }
                // 执行玩家命令完毕
        }

        if (++scs_step >= sizeof(scs))
        {
                write("计划执行完毕。\n");
                cancel_schedule(me);
                return;
        }

        my_temp["scs_step"] = scs_step;
}

private void done_input(object me, string text)
{
        string *strs;

        if (! stringp(text))
        {
                tell_object(me, "你没有输入任何新的计划。\n");
                return;
        }

        if (strlen(text) > 400)
        {
                tell_object(me, "你这份计划太长了，请重新设置一个短一些的。\n");
                return;
        }

        strs = explode(text, "\n");
        strs = filter_array(strs, (: replace_string($1, " ", "") != "" :));
        text = implode(strs, "\n") + "\n";

        me->set("schedule", text);
        tell_object(me, "你设置了一份新的计划。\n");
}

void user_quit(object me)
{
        if (! is_root(previous_object()) &&
            previous_object() != me)
                return;

        if (! objectp(me))
                return;

        me->force_me("quit");

        if (objectp(me) && ! interactive(me))
                me->start_call_out((: call_other, __FILE__, "user_quit", me :), 5);
}

int help (object me)
{
	write(@HELP
指令格式 : scheme [<edit> | <start> | <clear> | <show> <玩家>]
 
设定或开始你的计划。如果你需要长时间的读书或是练习技能，可以
使用计划来完成，具体请参见 help schedule。

edit  : 设定计划
start : 开始执行计划
clear : 清除目前的计划
show  : 显示某个玩家的计划，只有巫师才能使用这个命令。

执行计划期间可以使用 halt 命令中止你正在进行的计划。

see also: halt, breakup, purchase
HELP );
        return 1;
}
