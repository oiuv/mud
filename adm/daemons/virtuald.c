// virtuald.c
// Modified by mud.ren.

void create()
{
    seteuid(getuid());
}

// This function is called by master object to return the "virtual" object
// of <file> when dirver failed to find such a file.

mixed compile_object(string file)
{
    string virtual;
    object ob;
    int x, y, z, m, n;

    n = strsrch(file, "/", -1);
    if (n < 1)
    {
        return 0;
    }

    virtual = file[0..n - 1];

    if (file_size(virtual + ".c") < 1)
    {
        return 0;
    }

    if ((m = sscanf(file[n + 1..], "%d,%d,%d", x, y, z)) != 3)
    {
        if ((m = sscanf(file[n + 1..], "%d,%d", x, y)) != 2)
        {
            return virtual->query_maze_room(file[n + 1..]);
        }
    }

    if (m == 2 && !(ob = new (virtual, x, y)))
    {
        return 0;
    }
    else if (m == 3 && !(ob = new (virtual, x, y, z)))
    {
        return 0;
    }

    return ob;
}
