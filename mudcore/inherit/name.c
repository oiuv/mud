/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-30 14:09:10
 * @LastEditTime: 2022-03-30 14:09:10
 * @LastEditors: 雪风
 * @Description: 游戏对象名称设置接口
 *  https://bbs.mud.ren
 */

nosave string *my_id;

// void create(){}

// function called by present() in order to identify an object
int id(string arg)
{
    if (!arg)
        return 0;

    if (my_id && member_array(arg, my_id) != -1)
        return 1;
    else
        return this_object()->query("id") == arg;
}

varargs void set_name(string name, string *id)
{
    if (stringp(name))
    {
        this_object()->set("name", name);
    }
    else
    {
        this_object()->set("name", "无名氏");
    }

    if (pointerp(id))
    {
        this_object()->set("id", lower_case(id[0]));
        my_id = id;
        // 非玩家对象增加首字母ID，不可以使用 userp() 判断
        if (!this_object()->is_user())
        {
            my_id += ({lower_case(id[0][0..0])});
        }
    }
}

string name()
{
    string str;
    if (stringp(str = this_object()->query("name")))
        return str;
    else
        return file_name(this_object());
}

string short()
{
    string str;
    if (!stringp(str = this_object()->query("short")))
        str = name() + (this_object()->query("id") ? "(" + capitalize(this_object()->query("id")) + ")" : "");

    return str;
}

string long()
{
    string str, extra;

    if (!stringp(str = this_object()->query("long")))
        str = short() + "\n";
    if (stringp(extra = this_object()->extra_long()))
        str += extra;
    return str;
}

string *id_list()
{
    return my_id;
}

string *parse_command_id_list()
{
    return my_id || ({this_object()->query("id")});
}
