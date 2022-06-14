// reclaim.c
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me))
        return 0;
    write(sprintf("Total %d objects has been cleaned.\n", reclaim_objects()));
    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: reclaim
指令说明:
    清除那些不应继续保存在内存中的对象。
TEXT
    );
    return 1;
}
