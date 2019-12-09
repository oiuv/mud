// test
// clean_up.c
// by Annihilator@ES2
// Adapted for XKX by Xiang (12/15/95)

int clean_up()
{
    object *inv;
    int i;

    // log_file("clean_up", sprintf("%-50s - %s", file_name(this_object()), ctime(time()) + "\n"));

    if (! clonep() && this_object()->query("no_clean_up") == 1) return 1;

    if (this_object()->query("no_clean_up") > 1)
        log_file("no_clean_up", base_name(this_object()) + "\tflag ="
                 "= " + this_object()->query("no_clean_up") + "\n");

    if (interactive(this_object())) return 1;

    if (this_object()->query_temp("quest_ob"))
        // 正在为QUEST服务
        return 1;

    // If we are contained in something, let environment do the clean
    // up instead of making recursive call. This will prevent clean-up
    // time lag.
    if (environment()) return 1;

    inv = all_inventory();
    for (i = sizeof(inv) - 1; i >= 0; i--)
        if (interactive(inv[i]) ||
            inv[i]->query_temp("quest_ob") ||
            inv[i]->is_stay_in_room()) return 1;

    destruct(this_object());
    if (objectp(this_object()))
        log_file("no_destructed", base_name(this_object()) + " flag ="
                 "= " + this_object()->query("no_clean_up") + "\n");

    return 0;
}
