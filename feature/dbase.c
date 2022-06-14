// dbase.c
inherit CORE_DBASE;

nomask void delete_all_dbase()
{
    // if (!is_root(previous_object()))
    //     return;
    set_dbase(([]));
}

nomask void delete_all_temp_dbase()
{
    // if (!is_root(previous_object()))
    //     return;
    set_temp_dbase(([]));
}
