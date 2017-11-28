// cpemote.c
// created by doing

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
        string from, to;
        mapping emote;
        mapping toemote;
        int i;
        string *ks;

        if (! present("emote editor", me) &&
            ! SECURITY_D->valid_grant(me, "(immortal)"))
                return 0;

        seteuid(getuid());

        if (! VERSION_D->is_release_server())
                return notify_fail("只有版本发布站点才能修改表情动词。\n");

        if (! arg || sscanf(arg, "%s %s", from, to) != 2)
                return help(me);

        emote = EMOTE_D->query_emote(from);
        if (! emote || ! sizeof(emote))
                return notify_fail("没有(" + from + ")这个表情动词。\n");

        if ((toemote = EMOTE_D->query_emote(to)) && sizeof(toemote))
                return notify_fail("表情动词(" + to + ")已经存在，不能覆盖。\n");

        toemote = allocate_mapping(sizeof(emote));
        ks = keys(emote);
        for (i = 0; i < sizeof(ks); i++)
                toemote[ks[i]] = emote[ks[i]];

        EMOTE_D->set_emote(to, toemote);
        printf("表情动词(%s)复制到了(%s)。\n", from, to);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : cpemote <from> <to>

这个命令将原名为 <from> 的表情动词复制成为名字为 <to> 的新表
情动词。注意：原先必须不能存在名为 <to> 的表情动词，该操作不
能覆盖原先已经存在的表情动词。

由于表情动词会在版本同步时更新，因此只有版本发布站点才能够使
用这个命令。

see also：edemote、rnemote
HELP );
        return 1;
}

