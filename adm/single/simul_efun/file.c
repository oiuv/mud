// file.c
#include <ansi.h>

void cat(string file)
{
    if (previous_object())
        seteuid(geteuid(previous_object()));
    else
        seteuid(ROOT_UID);
    write(read_file(file));
}

void log_file(string file, string text)
{
    seteuid(ROOT_UID);
    write_file(LOG_DIR + file, text);
}

void assure_file(string file)
{
    string path, *dir;
    int i;

    if (file_size(file) != -1) return;

    seteuid(ROOT_UID);
    dir = explode(file, "/");

    if (file[strlen(file) - 1] != '/')
        // the file is refer to a file, not directory
        dir = dir[0..sizeof(dir)-2];

    path = "/";
    for (i = 0; i < sizeof(dir); i++)
    {
        path += dir[i];
        mkdir(path);
        path += "/";
    }

    dir = 0;
}

// Function name:   read_lines
// Description:     reads in a file, ignoring lines that begin with '#'
// Arguements:      file: a string that shows what file to read in.
// Return:          Array of nonblank lines that don't begin with '#'
// Note:            must be declared nosave (else a security hole)
string *read_lines(string file)
{
    string *list;
    string str;
    int i;

    str = read_file(file);
    if (!str)
        return ({});

    list = explode(str, "\n");
    for (i = 0; i < sizeof(list); i++)
        if (list[i][0] == '#')
            list[i] = 0;

    list -= ({ 0 });
    return list;
}

int file_lines(string file)
{
    return efun::file_length(file);
}

int file_exists(string file)
{
    return (file_size(file) >= 0);
}
