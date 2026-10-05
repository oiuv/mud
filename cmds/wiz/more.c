// more.c

inherit F_CLEAN_UP;

int main(object me, string arg) {
    string file, identity, provider;
    int split;
    object ob;

    if (!SECURITY_D->valid_grant(me, "(wizard)"))
        return 0;

    seteuid(geteuid(me));
    if (!arg)
        return notify_fail("指令格式 : more <档名>|<对象名> \n");
    file = resolve_path(me->query("cwd"), arg);
    if (file_size(file) < 0) {
        ob = present(arg, me);
        if (!ob)
            ob = present(arg, environment(me));
        if (!ob)
            return notify_fail("没有这个档案。\n");
        identity = base_name(ob);
        file = virtualp(ob) ? 0 : lpc_file(identity);
        if (!file && virtualp(ob)) {
            split = strsrch(identity, "/", -1);
            if (split > 0) {
                provider = lpc_file(identity[0..split - 1]);
                file = provider;
            }
        }
        if (!file)
            return notify_fail("找不到该对象的实体源码或虚拟处理程序源码。\n");
    }

    if (!SECURITY_D->valid_read(file, me, "read"))
        return notify_fail("你没有权限查看这个文件。\n");

    if (provider)
        write("虚拟对象 " + identity + "：查看处理程序源码 " + provider +
            "（不一定是对象实际执行的程序）。\n");
    me->start_more_file(file);
    return 1;
}

int help(object me) {
    write(@HELP
指令格式 : more <档案名>|<身上或所在房间的对象名>

这个指令让你可以以分页方式查阅一个文件的内容。
按对象名查看时，实体对象使用实际 .c/.lpc 源码；虚拟对象查看
其处理程序源码，并明确标记。处理程序可能返回另一程序的实例。
所有目标文件仍受读取权限约束，不会为了查询而创建对象。

see also: cat
HELP);
    return 1;
}
