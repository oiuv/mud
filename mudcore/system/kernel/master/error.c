// error.c
#include <runtime_config.h>

#define TRACE_DETAIL_LENGTH_LIMIT   300
string tracert_error(mapping error, int caught);

/**
 * @brief 日志记录
 *
 * @param file
 * @param message
 */
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
        log_file("log_error", message);
    }
    else
    {
        // 记录警告日志
        log_file("log", message);
    }
}

/**
 * @brief 编译错误追踪方法
 *
 * @param map
 * @param flag // catch(error("error"));
 */
void error_handler(mapping map, int flag)
{
    string str = tracert_error(map, flag);
    // 附加原始信息
    str += sprintf("%O\n", map);

    if (flag)
        debug("出错啦！详情记录在 error_handler 日志。");
    else
        printf("%s", map["error"]);

    log_file("error_handler", str);
}

/* 处理错误讯息的函数 */
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
