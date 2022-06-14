// 列出游戏所有活着的对象
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    print_r(livings());

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: livings
指令说明:
    列出所有活着的对象。
TEXT
    );
    return 1;
}
