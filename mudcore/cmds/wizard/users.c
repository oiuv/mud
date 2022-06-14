// 列出游戏所有玩家对象
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    printf("%O\n", users());

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: users
指令说明:
    列出所有玩家对象。
TEXT
    );
    return 1;
}
