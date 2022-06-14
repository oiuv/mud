// efun call_other
#include <ansi.h>
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
    object ob;
    string arg1, arg2, err;
    mixed res;

    if (!arg || sscanf(arg,"%s %s",arg1, arg2) != 2)
    {
        return help(me);
    }
    else if (ob = load_object(arg1))
    {
        if (err = catch(res = call_other(ob, explode(arg2, " "))))
        {
            debug("运行报错啦~>详细错误信息请看日志记录<：\n" + err);
        }
        else
        {
            debug("result = " + res);
        }
    }
    else
    {
        debug("没有找到对象 " + arg1);
    }

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: call_other <对象文件名> function [arg1 arg2 ...]
指令说明:
    执行指定文件中的方法。
TEXT
    );
    return 1;
}
