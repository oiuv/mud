//
// cmd_d.c
//
// By Annihilator (11/07/94)
// Update by Doing Lu

#pragma optimize
// #pragma save_binary

mapping search = ([]);

void rehash(string dir) {
    int i;
    string path;
    string *cmds;
    mapping cmdlist;
    string alias, name, stem;

    if (!sscanf(dir, "/cmds/%s", path) && !sscanf(dir, "/mudcore/cmds/%s", path)) {
        write("The path(" + dir + ")was not command path, "
            "operation was failed.\n");
        return;
    }

    if (dir[sizeof(dir) - 1] != '/')
        dir += "/";
    cmds = get_dir(dir);
    i = sizeof(cmds);
    cmdlist = allocate_mapping(i);

    // 取所有命令
    while (i--) {
        name = cmds[i];
        if (strlen(name) > 4 && name[<4..] == ".lpc") {
            stem = name[0..<5];
            cmdlist[stem] = dir + name;
        } else if (strlen(name) > 2 && name[<2..] == ".c") {
            stem = name[0..<3];
            if (!cmdlist[stem]) cmdlist[stem] = dir + name;
        }
    }

    // 取所有命令的别名
    i = sizeof(cmds);
    while (i--)
        if (strlen(cmds[i]) > 6 && cmds[i][<6..] == ".alias") {
            name = cmds[i][0..<7];
            alias = read_file(dir + cmds[i], 1, 1);
            if (!stringp(alias)) continue;
            alias = replace_string(alias, "\n", "");
            alias = replace_string(alias, "\r", "");
            if (strlen(alias) > 4 && alias[<4..] == ".lpc") alias = alias[0..<5];
            else if (strlen(alias) > 2 && alias[<2..] == ".c") alias = alias[0..<3];
            if (stringp(cmdlist[alias])) cmdlist[name] = cmdlist[alias];
        }

    search[dir] = cmdlist;
}

string find_command(string verb, string *path) {
    int i;
    string file;
    mapping current;

    if (!pointerp(path))
        return 0;

    for (i = 0; i < sizeof(path); i++) {
        if (undefinedp(current = search[path[i]])) {
            rehash(path[i]);
            if (undefinedp(current = search[path[i]]))
                continue;
        }
        if (stringp(file = current[verb]))
            return file;
    }
    return 0;
}
