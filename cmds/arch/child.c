// child.c

inherit F_CLEAN_UP;

int main(object me, string str) {
    object where, *list;
    int i, number;

    if (!SECURITY_D->valid_grant(me, "(arch)"))
        return 0;

    if (!str)
        str = me->query("cwf");
    if (!str)
        return notify_fail("你要查看哪个文件？\n");

    str = resolve_path(me->query("cwd"), str);
    str = lpc_object_path(str);
    me->set("cwf", str);

    list = children(str);
    number = sizeof(list);
    if (number) {
        for (i = 0; i < sizeof(list); i++) {
            write((int)(i + 1) + ". " + file_name(list[i]) + " " +
                list[i]->name(1) + "(" +
                list[i]->query("id") + ") is at ");
            where = environment(list[i]);
            if (where) {
                if (where->query("short")) {
                    write(where->query("short"));
                } else {
                    write(where->short());
                }
                write("(" + file_name(where) + ")\n");
            } else {
                write("???\n");
            }
        }
    } else
        write("没有找到任何派生对象。\n");

    return 1;
}

int help(object me) {
    write(@HELP
指令格式: child filename

列出某个身份下已加载的蓝图和所有副本，不主动创建对象。
支持 .c、.lpc 或无扩展名路径，以及虚拟路径。
例如：child /d/items/neck/baijin_quan

HELP);
    return 1;
}
