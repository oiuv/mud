// save_ed_setup and restore_ed_setup are called by the ed to maintain
// individual options settings. These functions are located in the master
// object so that the local admins can decide what strategy they want to use.
int save_ed_setup(object who, int code)
{
    string file;

    if (! intp(code))
        return 0;

    file = user_path(getuid(who)) + ".edrc";
    rm(file);
    return write_file(file, code + "");
}

// Retrieve the ed setup. No meaning to defend this file read from
// unauthorized access.
int retrieve_ed_setup(object who)
{
    string file;
        int code;

    file = user_path(getuid(who)) + ".edrc";
    if (file_size(file) <= 0)
        return 0;

    sscanf(read_file(file), "%d", code);
    return code;
}

// make_path_absolute: This is called by the driver to resolve path names in ed.
string make_path_absolute(string file)
{
    file = resolve_path((string)this_player()->query("cwd"), file);
    return file;
}

// called if a user connection is broken while in the editor; allows
// the mudlib to save the changes in an alternate file without modifying
// the original
string get_save_file_name(string fname)
{
    return fname + "." + time();
}
