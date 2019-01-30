//
// cmd_d.c
//
// By Annihilator (11/07/94)
// Update by Doing Lu

// #pragma optimize
// #pragma save_binary

mapping search = ([ ]);

void rehash(string dir)
{
        int i;
        string path;
        string *cmds;
        mapping cmdlist;
        string alias;

        if (! sscanf(dir, "/cmds/%s", path))
        {
                write("The path(" + dir + ")was not command path, "
                      "operation was failed.\n");
                return;
        }

        if (dir[sizeof(dir) - 1] != '/') dir += "/";
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
                search[dir] = cmdlist;
}

string find_command(string verb, string *path)
{
        int i;
        string file;
        mapping current;

        if (! pointerp(path)) return 0;

        for (i = 0; i < sizeof(path); i++)
        {
                if (undefinedp(current = search[path[i]]))
                {
                        rehash(path[i]);
                        if (undefinedp(current = search[path[i]]))
                                continue;
                }
                if (stringp(file = current[verb]))
                        return file;
        }
        return 0;
}

