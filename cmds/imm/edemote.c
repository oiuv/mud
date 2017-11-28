// edemote.c
// updated by doing

inherit F_CLEAN_UP;

int in_use;

int main(object me, string arg)
{
        mapping emote;
        int i;

        if (! present("emote editor", me) &&
            ! SECURITY_D->valid_grant(me, "(immortal)"))
                return 0;

        seteuid(getuid());

        if (! VERSION_D->is_release_server())
                return notify_fail("只有版本发布站点才能修改表情动词。\n");

        if (! arg) return notify_fail("你要编辑什么 emote？\n");

        if (sscanf(arg, "-d %s", arg))
        {
                write("删除 emote：" + arg + "\n");
                EMOTE_D->delete_emote(arg);
                return 1;
        }

        if (sscanf(arg, "-p %s", arg))
        {
                if (! mapp(emote = EMOTE_D->query_emote(arg)) ||
                    ! sizeof(emote))
                {
                        write("没有这个表情动词。\n");
                        return 1;
                }

                write(sprintf("上次修改：%s(%s)\n", emote["updated"], ctime(emote["time"])));
                write(sprintf("—————————————————————\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n",
                        emote["myself"], emote["others"], emote["myself_self"],
                        emote["others_self"], emote["myself_target"], emote["target"],
                        emote["others_target"]));
                return 1;
        }

        write(sprintf("arg = %s\n", arg));
        for (i = 0; i < strlen(arg); i++)
                if (arg[i] <= 32 || arg[i] > 'z')
                        return notify_fail("表情动词必须由字母或数字、标点构成。\n");

        emote = EMOTE_D->query_emote(arg);
        if (! mapp(emote)) emote = ([ ]);

        emote["updated"] = geteuid(me);

        write("编辑 emote：" + arg + "\n");
        write("讯息可以有好几行，用 . 表示结束。\n"
              "输入 x 表示该行采用同一族类似的表情描述。\n");
        write("讯息中可使用的参数有以下几种：\n");
        write("  $N  自己的名字。\n");
        write("  $n  使用对象的名字。\n");
        write("  $P  自己的人称代名词，如你、你、他、她、它、它。\n");
        write("  $p  使用对象的人称代名词，如你、你、他、她、它、它。\n");
        write("  $S  对自己的称呼。\n");
        write("  $s  对自己的粗鲁称呼。\n");
        write("  $C  对自己的呢称。\n");
        write("  $c  对别人的呢称。\n");
        write("  $R  对别人的尊称。\n");
        write("  $r  对别人的粗鲁称呼。\n");
        write("————————————————————————————————————\n");
        write("不指定对象使用这个 emote 时，你自己看到的讯息：\n->");
        input_to("get_msg_myself", emote, arg);
        return 1;
}


int get_msg_myself(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "myself");
                else
                if (! n) write("忽略该项描述。\n");
                write("不指定对象使用这个 emote 时，其他人看到的讯息：\n->");
                input_to("get_msg_others", emote, pattern);
                return 1;
        }

        if (! n) map_delete(emote, "myself");
        if (! undefinedp(emote["myself"]))
                emote["myself"] += msg + "\n";
        else emote["myself"] = msg + "\n";
        write("->");
        input_to("get_msg_myself", emote, pattern, n + 1);
        return 1;
}

int get_msg_others(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "others");
                else
                if (! n) write("忽略该项描述。\n");
                write("对自己使用这个 emote 时，自己看到的讯息：\n->");
                input_to("get_msg_myself_self", emote, pattern);
                return 1;
        }

        if (! n) map_delete(emote, "others");
        if (! undefinedp(emote["others"]))
                emote["others"] += msg + "\n";
        else emote["others"] = msg + "\n";
        write("->");
        input_to("get_msg_others", emote, pattern, n + 1);
        return 1;
}

int get_msg_myself_self(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "myself_self");
                else
                if (! n) write("忽略该项描述。\n");
                write("对自己使用这个 emote 时，其他人看到的讯息：\n->");
                input_to("get_msg_others_self", emote, pattern);
                return 1;
        }

        if (! n) map_delete(emote, "myself_self");
        if (! undefinedp(emote["myself_self"]))
                emote["myself_self"] += msg + "\n";
        else emote["myself_self"] = msg + "\n";
        write("->");
        input_to("get_msg_myself_self", emote, pattern, n + 1);
        return 1;
}

int get_msg_others_self(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "others_self");
                else
                if (! n) write("忽略该项描述。\n");
                write("对别人使用这个 emote 时，自己看到的讯息：\n->");
                input_to("get_msg_myself_target", emote, pattern);
                return 1;
        }

        if (! n) map_delete(emote, "others_self");
        if (! undefinedp(emote["others_self"]))
                emote["others_self"] += msg + "\n";
        else emote["others_self"] = msg + "\n";
        write("->");
        input_to("get_msg_others_self", emote, pattern, n + 1);
        return 1;
}

int get_msg_myself_target(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "myself_target");
                else
                if (! n) write("忽略该项描述。\n");
                write("对别人使用这个 emote 时，使用对象看到的讯息：\n->");
                input_to("get_msg_target", emote, pattern);
                return 1;
        }

        if (! n) map_delete(emote, "myself_target");
        if (! undefinedp(emote["myself_target"]))
                emote["myself_target"] += msg + "\n";
        else emote["myself_target"] = msg + "\n";
        write("->");
        input_to("get_msg_myself_target", emote, pattern, n + 1);
        return 1;
}

int get_msg_target(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "target");
                else
                if (! n) write("忽略该项描述。\n");
                write("对别人使用这个 emote 时，除你自己和使用对象外，其他人看到的讯息：\n->");
                input_to("get_msg_others_target", emote, pattern);
                return 1;
        }

        if (! n) map_delete(emote, "target");
        if (! undefinedp(emote["target"]))
                emote["target"] += msg + "\n";
        else emote["target"] = msg + "\n";
        write("->");
        input_to("get_msg_target", emote, pattern, n + 1);
        return 1;
}

int get_msg_others_target(string msg, mapping emote, string pattern, int n)
{
        msg = replace_string(msg, "\\n", "\n");
        if (msg == "." || msg == "x")
        {
                if (msg == "x")
                        map_delete(emote, "others_target");
                else
                if (! n) write("忽略该项描述。\n");
                emote["time"] = time();
                EMOTE_D->set_emote(pattern, emote);
                write("Emote 编辑结束。\n");
                return 1;
        }

        if (! n) map_delete(emote, "others_target");
        if (! undefinedp(emote["others_target"]))
                emote["others_target"] += msg + "\n";
        else emote["others_target"] = msg + "\n";
        write("->");
        input_to("get_msg_others_target", emote, pattern, n + 1);
        return 1;
}

int help(object me)
{
write(@HELP
指令格式 : edemote [-d|-p] <emote>

这个指令可以修改，删除 emote 或列出其内容。 加上 -d 参数会删
除指定的 emote，-p 参数则会列出指定 emote 的内容. 列出的顺序
与编辑 emote 时相同.
 
输入 emote 讯息时有三个项目：没有目标， 指定目标或是对自己。
若不想修改某项讯息，则直接在空白行输入 '.' 跳过.
 
一个 emote 讯息可以有很多行, 在空白行输入 '.' 表示结束输入该
项 emote.
 
编辑 emote 时可以用以下的符号来表示:
 
$N : 自己的名字.
$n : 目标的名字.
$P : 自己的人称代名词.
$p : 目标的人称代名词.
$S : 对自己的称呼。
$s : 对自己的粗鲁称呼。
$C : 对自己的呢称。
$c : 对别人的呢称。
$R : 对别人的尊称。
$r : 对别人的粗鲁称呼。

由于表情动词会在版本同步时更新，因此只有版本发布站点才能够使
用这个命令。

see also：edemote、rnemote
HELP );
    return 1;
}

