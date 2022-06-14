inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    string *emote;
    int i;

    if (!wizardp(me))
        return 0;

    if (!arg)
        return notify_fail("你要编辑什么 emote ？\n");

    if (arg == "-d" || arg == "-p")
        return notify_fail("指令格式 : emote [-d|-p] <emote>\n");

    if (sscanf(arg, "-d %s", arg))
    {
        write("删除 emote：" + arg + "\n");
        return EMOTE_D->delete_emote(arg);
    }

    if (sscanf(arg, "-p %s", arg))
    {
        if (!arrayp(emote = EMOTE_D->query_emote(arg)) || !sizeof(emote))
        {
            write("没有这个表情动词。\n");
            return 1;
        }
        write(sprintf("—————————————————————\n%s\n%s\n", emote[0], emote[1]));
        return 1;
    }

    if (arrayp(emote = EMOTE_D->query_emote(arg)) && sizeof(emote))
    {
        write("系统存在这个表情，如果需要编辑请先删除。\n");
        return 1;
    }

    write(sprintf("arg = %s\n", arg));

    for (i = 0; i < strlen(arg); i++)
        if (arg[i] <= 32 || arg[i] > 'z')
            return notify_fail("表情动词必须由字母或数字、标点构成。\n");

    emote = EMOTE_D->query_emote(arg);
    if (!arrayp(emote))
        emote = allocate(2);

    write("编辑 emote：" + arg + "\n");
    write("讯息可以有好几行，用 . 表示结束，用 x 取消编辑。\n");
    write("讯息中可使用的参数有以下几种：\n");
    write("  $ME  自己；$YOU  对象\n");
    write("————————————————————————————————————\n");
    write("不指定对象使用这个 emote 时的讯息：\n->");
    input_to("get_msg_myself", emote, arg);
    return 1;
}

int get_msg_myself(string msg, string *emote, string pattern, int n)
{
    msg = replace_string(msg, "\\n", "\n");
    if (msg == "x")
    {
        write("你取消了表情编辑。\n");
        return 1;
    }

    if (msg == ".")
    {
        if (!n)
            write("忽略该项描述。\n");
        write("指定对象使用这个 emote 时的讯息：\n->");
        input_to("get_msg_others", emote, pattern);
        return 1;
    }

    emote[0] = msg;
    write(msg + "\n->");
    input_to("get_msg_myself", emote, pattern, n + 1);
    return 1;
}

int get_msg_others(string msg, string *emote, string pattern, int n)
{
    msg = replace_string(msg, "\\n", "\n");
    if (msg == "x")
    {
        write("你取消了表情编辑。\n");
        return 1;
    }
    if (msg == ".")
    {
        if (!n)
            write("忽略该项描述。\n");
        write("OK!");
        EMOTE_D->set_emote(pattern, emote);
        return 1;
    }
    emote[1] = msg;
    write(msg + "\n->");
    input_to("get_msg_others", emote, pattern, n + 1);
    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式 : emote [-d|-p] <emote>

这个指令可以修改，删除 emote 或列出其内容。 加上 -d 参数会删
除指定的 emote，-p 参数则会列出指定 emote 的内容.

一个 emote 讯息可以有很多行, 在空白行输入 '.' 表示结束输入该
项 emote.

编辑 emote 时可以用以下的符号来表示:
$ME : 自己的名字.
$YOU : 目标的名字.

HELP );
    return 1;
}
