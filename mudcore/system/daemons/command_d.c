#ifndef CMD_PATH_WIZ
#define CMD_PATH_WIZ ({CORE_DIR "cmds/wizard/"})
#endif
#ifndef CMD_PATH_STD
#define CMD_PATH_STD ({CORE_DIR "cmds/player/"})
#endif

private nosave mapping default_aliases = ([
    "s":"go south",
    "n":"go north",
    "w":"go west",
    "e":"go east",
    "sd":"go southdown",
    "nd":"go northdown",
    "wd":"go westdown",
    "ed":"go eastdown",
    "su":"go southup",
    "nu":"go northup",
    "wu":"go westup",
    "eu":"go eastup",
    "sw":"go southwest",
    "se":"go southeast",
    "nw":"go northwest",
    "ne":"go northeast",
    "d":"go down",
    "u":"go up",
    "i":"inventory",
]);

nosave mapping commands = ([]);

nomask mapping query_commands()
{
    return commands;
}

string default_alias(string verb)
{
    string *word;

    // verb = lower_case(verb);

    switch (verb[0])
    {
    case '.':
        return "say " + verb[1..];
    }

    word = explode(verb, " ");
    if (sizeof(word) && !undefinedp(default_aliases[word[0]]))
    {
        word[0] = default_aliases[word[0]];
        return implode(word, " ");
    }

    return verb;
}

mapping query_default_alias()
{
    return default_aliases;
}

void set_alias(mapping aliases)
{
    default_aliases = aliases;
}

void add_alias(mapping aliases)
{
    default_aliases += aliases;
}

// 缓存所有指令，增加文件别名功能
void rehash()
{
    int i;
    string *cmds, *path = CMD_PATH_STD + CMD_PATH_WIZ;
    string alias;
    mapping cmdlist;

    foreach(string dir in path)
    {
        if (dir[sizeof(dir) - 1] != '/')
            dir += "/";

        cmds = get_dir(dir);
        i = sizeof(cmds);
        cmdlist = allocate_mapping(i);
        // 取所有命令
        while (i--)
            if (sscanf(cmds[i], "%s.c", cmds[i]))
                cmdlist[cmds[i]] = dir + cmds[i] + ".c";
        // 取所有命令的别名
        i = sizeof(cmds);
        while (i--)
            if (sscanf(cmds[i], "%s.alias", cmds[i]))
            {
                alias = read_file(dir + cmds[i] + ".alias", 1, 1);
                alias = replace_string(alias, "\n", "");
                alias = replace_string(alias, "\r", "");
                sscanf(alias, "%s.c", alias);
                if (member_array(alias, cmds) != -1)
                    cmdlist[cmds[i]] = dir + alias + ".c";
            }

        if (sizeof(cmds))
            commands[dir] = cmdlist;
    }
}

object find_command(string verb)
{
    object file;
    string *path = CMD_PATH_STD;
    mapping current;

    if (this_player() && wizardp(this_player()))
    {
        path += CMD_PATH_WIZ;
    }

    foreach(string p in path)
    {
        if (undefinedp(current = commands[p]))
        {
            rehash();
            if (undefinedp(current = commands[p]))
                continue;
        }
        if (stringp(current[verb]) && objectp(file = load_object(current[verb])))
        {
            return file;
        }
    }

    return 0;
}

string short()
{
    return "指令精灵(COMMAND_D)";
}

protected void create()
{
    rehash();
}
