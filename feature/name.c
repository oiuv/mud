// name.c

nosave string *my_id;

varargs void set_name(string name, string *id)
{
    string fullname;

    if (!stringp(name))
    {
        if (!stringp(fullname = this_object()->query("surname")))
            fullname = "";

        if (stringp(this_object()->query("purename")))
            fullname += this_object()->query("purename");

        if (fullname == "")
            fullname = "无名氏";

        this_object()->set("name", fullname);
    }
    else
    {
        this_object()->set("name", name);
    }

    if (pointerp(id))
    {
        this_object()->set("id", id[0]);
        my_id = id;
        // 非玩家对象增加首字母ID，不可以使用 userp() 判断
        if (!this_object()->is_user())
        {
            my_id += ({lower_case(id[0][0..0])});
        }
    }
}

int id(string str)
{
    //    string *applied_id;

    if (!str)
        return 0;

    // 彻底隐身
    if (this_object()->is_character() && this_player() &&
        !this_player()->visible(this_object()))
        return 0;

    // Remove apply/id for speed
    // If apply/id exists, this object is "pretending" something, don't
    // recognize original id to prevent breaking the pretending with "id"
    // command.

    if (my_id && member_array(str, my_id) != -1)
        return 1;
    else
        return 0;
}

string *parse_command_id_list()
{
    string *applied_id;

    if (pointerp(applied_id = this_object()->query_temp("apply/id")) && sizeof(applied_id))
        return applied_id;
    else
        return my_id;
}

varargs string name(int raw)
{
    string str, *mask;
    if (!raw && sizeof(mask = this_object()->query_temp("apply/name")))
        return mask[sizeof(mask) - 1];
    else
    {
        if (stringp(str = this_object()->query("name")))
            return str;
        else
            return file_name(this_object());
    }
}

varargs string short(int raw)
{
    string str;

    if (raw || !stringp(str = this_object()->query("short")))
        str = name(raw) + (stringp(this_object()->query("id")) ? "(" + capitalize(this_object()->query("id")) + ")" : "");
    return str;
}

varargs string long(int raw)
{
    string str, extra, *mask;

    if (!raw && sizeof(mask = this_object()->query_temp("apply/long")))
        str = mask[sizeof(mask) - 1];
    else if (!stringp(str = this_object()->query("long")))
        str = short(raw) + "。\n";

    if (stringp(extra = this_object()->extra_long()))
        str += extra;

    return str;
}
