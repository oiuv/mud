// preload.c

string *epilog(int load_empty)
{
    string *items = ({});
    debug_message("[" + ctime() + "]CORE_MASTER_OB->epilog()!");
#ifdef PRELOAD
    items = read_lines(PRELOAD);
#endif
    return items;
}

// preload an object
void preload(string file)
{
    string err;

    if (file_size(file + ".c") == -1)
        return;

    err = catch(call_other(file, "??"));
    if (err != 0) {
        write("[CORE_MASTER_OB]->preload():Error " + err + " when loading " + file + "\n");
    }
}
