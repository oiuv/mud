// 列出当前玩家对象可用的所有局部函数
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    printf("%O\n", functions(me, to_int(arg)));

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: functions [flag]
指令说明:
    列出当前玩家对象可用的所有局部函数。
TEXT
    );
    return 1;
}
