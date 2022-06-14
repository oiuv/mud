inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    function f;

    if (wizardp(me))
    {
        f = bind((: disable_wizard :), me);
        write("disable_wizard!\n");
    }
    else // no use
    {
        f = bind((: enable_wizard :), me);
        write("enable_wizard!\n");
    }

    evaluate(f);

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式: wizard
指令说明:
    这个指令可以临时关闭wizard权限。
HELP );
    return 1;
}
