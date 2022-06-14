// 打印游戏所有有心跳的对象
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    printf("%O\n", heart_beats());

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: heart_beats
指令说明:
    列出所有具有心跳的对象。
TEXT
    );
    return 1;
}
