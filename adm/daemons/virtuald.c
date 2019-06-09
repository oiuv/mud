// virtuald.c
// Modified by Find.

void create()
{
    seteuid(getuid());
}

// This function is called by master object to return the "virtual" object
// of <file> when dirver failed to find such a file.
/*
object compile_object(string file)
{
    string pname = file;
    object ob;

    while (1)
    {
        int idx = strsrch(pname, "/", -1);

        if (idx == -1)
            return 0;

        if (idx != 0)
            pname = pname[0..idx - 1];

        if (file_size(pname + ".c") >= 0)
            if (ob = pname->query_maze_room(file[idx + 1..]))
            {
                ob->set_virtual_flag();
                return ob;
            }
        if (!idx)
            return 0;
    }

    return 0;
}
 */

mixed compile_object(string file)
{
    string *path, cfile;
    object ob;
    int x, y, z, elements, n;
    // debug_message(file);
    path = explode(file, "/");
    n = sizeof(path) - 1;
    cfile = replace_string(file, "/" + path[n], "");

    if (file_size(cfile + ".c") < 1)
        return 0; // "¶ÔÏó²»´æÔÚ£¡"

    if ((elements = sscanf(path[n], "%d,%d,%d", x, y, z)) != 3)
    {
        if ((elements = sscanf(path[n], "%d,%d", x, y)) != 2)
            return 0; // "È±ÉÙ×ø±ê£¡"
    }

    if (elements == 2 && !(ob = new (cfile, x, y)))
        return 0; // "±àÒëÊ§°Ü£¡"
    else if (elements == 3 && !(ob = new (cfile, x, y, z)))
        return 0; // "±àÒëÊ§°Ü£¡"

    return ob;
}
