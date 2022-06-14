#include <ansi.h>
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{

    if (!arg)
    {
        return help(me);
    }

    print_r(children(arg));

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: children <对象文件名>
指令说明:
    列出指定对象的 children 对象。
TEXT
    );
    return 1;
}
