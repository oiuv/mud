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

varargs void log_file(string file, string text, int flag)
{
    seteuid(ROOT_UID);
    CORE_SIMUL_EFUN_OB->log_file(file, text, flag);
}

// void assure_file(string file)
// {
//     string path, *dir;
//     int i;

//     if (file_size(file) != -1) return;

//     seteuid(ROOT_UID);
//     dir = explode(file, "/");

//     if (file[strlen(file) - 1] != '/')
//         // the file is refer to a file, not directory
//         dir = dir[0..sizeof(dir)-2];

//     path = "/";
//     for (i = 0; i < sizeof(dir); i++)
//     {
//         path += dir[i];
//         mkdir(path);
//         path += "/";
//     }

//     dir = 0;
// }

int file_lines(string file)
{
    return efun::file_length(file);
}

int file_exists(string file)
{
    return (file_size(file) >= 0);
}
