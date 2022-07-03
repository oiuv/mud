// Function name:       epilog
// Return:              List of files to preload
string *epilog(int load_empty)
{
    string *items;

    items = read_lines(CONFIG_DIR + "preload");
    return items;
}

// preload an object
void preload(string file)
{
    if (objectp(find_object(file)))
        return;

    if (file_size(file + ".c") == -1)
        return;

    catch(load_object(file));
}

// 调试
void check_daemons()
{
    string *sp;
    int i;

    sp = epilog(0);
    if (! sp) return;

    for (i = 0; i < sizeof(sp); i++)
        if (stringp(sp[i])) preload(sp[i]);
}
