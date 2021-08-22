/*
 * @Author: 雪风@mud.ren
 * @Date: 2020-12-26 16:43:34
 * @LastEditTime: 2021-08-22 15:02:07
 * @LastEditors: 雪风
 * @Description: 管理员测试指令
 *  https://bbs.mud.ren
 */
inherit F_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me))
        return 0;

    /* clean up first */
    if (file_size("/dump/tmp_eval_file.c") != -1)
        rm("/dump/tmp_eval_file.c");
    if (find_object("/dump/tmp_eval_file"))
        destruct(find_object("/dump/tmp_eval_file"));

    write_file("/dump/tmp_eval_file.c", "mixed eval(object me) { " + arg + "; }\n");
    printf("Result = %O\n", "/dump/tmp_eval_file"->eval(me));
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
