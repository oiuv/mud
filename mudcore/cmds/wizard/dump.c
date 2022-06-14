// dump.c 导出游戏对象
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me))
        return 0;

    dumpallobj();
    write("OBJ_DUMP!\n");

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式: dump
指令说明:
    dump the stats of all objects to a file in root dir named OBJ_DUMP.
HELP
    );
    return 1;
}
