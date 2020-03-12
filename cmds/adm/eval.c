inherit F_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me))
        return 0;

    /* clean up first */
    if (file_size("/dump/tmp_eval_file.c") != -1)
    rm ("/dump/tmp_eval_file.c");
    if (find_object("/dump/tmp_eval_file"))
    destruct(find_object("/dump/tmp_eval_file"));

    write_file("/dump/tmp_eval_file.c","mixed eval() { " + arg + "; }\n");
    printf("Result = %O\n", "/dump/tmp_eval_file"->eval());
    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式 : eval <lpc code>

测试专用，请先实现功能后运行。

HELP);

    return 1;
}
