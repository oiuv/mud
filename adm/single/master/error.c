#include <runtime_config.h>

// simulate the old behavior of the driver
string standard_trace(mapping error, int caught)
{
    int i, s;
    string res;
    object me;
    mixed *cmds;

    /* keep track of number of errors per object...if you're into that */

    res = (caught) ? "错误讯息被拦截：" : "";
    res = sprintf("%s\n执行时段错误：%s\n程式：%s 第 %i 行\n物件：%s\n",
                  res, error["error"],
                  error["program"], error["line"],
                  error["object"] ? file_name(error["object"]) : "0");

    if (! error["object"] && (me = this_player()))
    {
        res += sprintf("当前玩家：%s(%s) - %O  所在环境：%O\n",
                       me->name(1), me->query("id"), me, environment(me));
        cmds = me->query_commands();
        res += me->name(1) + "身上及四周的物品与所在的环境提供以下指令：\n";
        for(i = 0; i<sizeof(cmds); i++)
            res += sprintf("%-15s  %2d %O\n",
                           cmds[i][0], cmds[i][1], cmds[i][2]);

        res += sprintf("当前的命令：%O\n", me->query_last_input());
    }

    i = 0;
    s = sizeof(error["trace"]);
    if (! this_player(1) && this_player())
    {
        // filter error trace of messaged & chat command
        for (; i < s; i++)
        {
            string prog;
            prog = "/" + error["trace"][i]["program"];
            if (prog != MESSAGE_D + ".c" &&
                ! sscanf(prog, "/cmds/chat/%*s") &&
                prog != "/clone/user/chatter.c" &&
                prog != F_COMMAND)
                    break;
        }
    }

    for (; i < s; i++)
    {
        res = sprintf("%s呼叫来自：%s 的 %s() 第 %i 行，物件： %O\n",
                  res,
                      error["trace"][i]["program"],
                      error["trace"][i]["function"],
                      error["trace"][i]["line"],
                      error["trace"][i]["object"]);
    }
    return res;
}

/* 处理错误讯息的函数 */
#define TRACE_DETAIL_LENGTH_LIMIT   300

string tracert_error(mapping error, int caught)
{
    int count;
    string err_msg;
    mapping trace;

    err_msg = sprintf(@ERR
──────────────<Bugs Report>──────────────
[ 错误时间 ]: %-s
[ 错误內容 ]: %-s
[ 错误档案 ]: %-s
[ 错误行数 ]: %-d
[ 资料回溯 ]:
ERR,
    ctime(time()),
    replace_string(error["error"], "\n", " "),
    error["file"],
    error["line"]);

    foreach(trace in error["trace"])
    {
        count++;
        err_msg += sprintf(@ERR
    -- 第 %|3d 笔 --
        [ 触发对象 ]: %O
        [ 程序档案 ]: %s
        [ 函数名称 ]: %s(%s)
        [ 呼叫行数 ]: %s
ERR,
        count,
        trace["object"],
        trace["program"] || "",
        trace["function"] || "",
        trace["arguments"] ? implode(map(trace["arguments"], (: typeof($1) :)), ", ") : "",
        (trace["line"] || "未知") + "");

        if (trace["arguments"])
        {
            err_msg += "        [ 传入参数 ]:\n";
            err_msg += implode(map(trace["arguments"], (: "                   ** (" + typeof($1) + ")" + implode(explode(sprintf("%." + TRACE_DETAIL_LENGTH_LIMIT + "O\n", $1) + (strlen(sprintf("%O", $1)) > TRACE_DETAIL_LENGTH_LIMIT ? "... 讯息过长省略\n" : ""), "\n"), "\n                      ") :)), "\n") + "\n";
        }
        if (trace["locals"])
        {
            err_msg += "        [ 程序变量 ]:\n";
            err_msg += implode(map(trace["locals"], (: "                   ** (" + typeof($1) + ")" + implode(explode(sprintf("%." + TRACE_DETAIL_LENGTH_LIMIT + "O\n", $1) + (strlen(sprintf("%O", $1)) > TRACE_DETAIL_LENGTH_LIMIT ? "... 讯息过长省略\n" : ""), "\n"), "\n                      ") :)), "\n") + "\n";
        }
    }
    err_msg += "──────────────<Bugs Report>──────────────\n";

    return err_msg;
}

// The mudlib runtime error handler.
void error_handler(mapping error, int caught)
{
    string trace = standard_trace(error, caught);

    // catch(error(x))
    if (caught)
    {
        efun::write_file(LOG_DIR + "catch_error", tracert_error(error, caught));
        return;
    }

    if (this_player(1))
    {
        this_player(1)->set_temp("error", error);
        tell_object(this_player(1), trace);
    }
    else if (this_player())
        tell_object(this_player(), trace);

    trace += "[" + ctime() + "]";
    trace += sprintf("\n%O\n", error);
    // whatever we return goes to the debug.log
    efun::write_file(LOG_DIR + "error_handler", trace);
}

// Write an error message into a log file. The error occured in the object
// 'file', giving the error message 'message'.
void log_error(string file, string message)
{
    if (strsrch(message, "Warning") == -1)
    {
        if (this_player(1))
        {
            if (wizardp(this_player(1)))
                efun::write("编译时段错误：" + message + "\n");
            else
                efun::write(get_config(__DEFAULT_ERROR_MESSAGE__) + "\n");
        }
        // 记录错误日志
        efun::write_file(LOG_DIR + "log_error", message);
    }
    else
    {
        // 记录警告日志
        efun::write_file(LOG_DIR + "log", message);
    }
}
