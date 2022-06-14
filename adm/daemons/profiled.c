// profiled.c

#define MAX_ENTRIES 300

mapping command_log;
int overflowed_log;

string sorting_by;

void create()
{
    seteuid(getuid());

    command_log = allocate_mapping(MAX_ENTRIES);
    overflowed_log = 0;
}

void log_command(string entry, int mem, int stime, int utime, int cost)
{
    if( !undefinedp(command_log[entry]) )
    {
        command_log[entry]["count"] ++;
        command_log[entry]["mem"] += mem;
        command_log[entry]["stime"] += stime;
        command_log[entry]["utime"] += utime;
        command_log[entry]["cost"] = cost;
    }
    else if( sizeof(command_log) <= MAX_ENTRIES )
    {
        command_log[entry] = ([
            "count" : 1,
            "mem"   : mem,
            "stime" : stime,
            "utime" : utime,
            "cost"  : cost,
        ]);
    }
    else
        overflowed_log++;
}

void make_profile(string sort_by)
{
    int i;
    string *entry, msg;

    entry = keys(command_log);
    sorting_by = sort_by;

    if( !stringp(sort_by) )
        entry = sort_array(entry, 1);
    else
        entry = sort_array(entry, "sort_entry", this_object() );
    msg = "指令           次数           内存使用            系统时间       使用者时间     eval_cost\n";
    for(i=0; i<sizeof(entry); i++)
        msg += sprintf("%-15s%-15d%-20d%-15d%-15d%-15d\n", entry[i],
            command_log[entry[i]]["count"],
            command_log[entry[i]]["mem"],
            command_log[entry[i]]["stime"],
            command_log[entry[i]]["utime"],
            command_log[entry[i]]["cost"]);
    rm("/PROFILE");
    write_file("/PROFILE", msg);
}

int sort_entry(string entry1, string entry2)
{
    if( command_log[entry1][sorting_by] < command_log[entry2][sorting_by])
        return -1;
    else if( command_log[entry1][sorting_by] > command_log[entry2][sorting_by])
        return 0;
    return 0;
}
