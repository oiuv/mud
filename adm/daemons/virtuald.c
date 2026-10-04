// virtuald.c
// Modified by mud.ren.

void create() {
    seteuid(getuid());
}

// master 在找不到实体源码时调用；业务参数只由处理程序解释。

mixed compile_object(string file) {
    string virtual;
    object provider;
    mixed result;
    int n;

    if (!stringp(file) || file == "")
        return 0;
    if (file[0] != '/')
        file = "/" + file;
    n = strsrch(file, "/", -1);
    if (n < 1 || n == strlen(file) - 1) {
        return 0;
    }

    virtual = file[0..n - 1];

    if (file_size(virtual + ".lpc") < 0 && file_size(virtual + ".c") < 0) {
        log_file("virtual", sprintf("[%s]%s %O\n", ctime(), file, all_previous_objects()));
        return 0;
    }

    provider = load_object(virtual);
    result = provider->create_virtual_object(file[n + 1..]);
    if (result == 0)
        return 0;
    if (!objectp(result) || result == provider || !clonep(result) || virtualp(result))
        error("Virtual provider must return a fresh clone or zero.\n");
    return result;
}
