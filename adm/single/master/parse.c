#include <parser_error.h>

string *parse_command_prepos_list()
{
    // debug_message("parse_command_prepos_list");
    return ({"in", "with", "without", "into", "for", "on", "under", "against",
             "out", "within", "of", "from", "between", "at", "to", "over", "near",
             "inside", "onto", "off", "through", "across", "up", "down", "every",
             "around", "about", "only", "here", "room", "exit", "enter"});
}

string parser_error_message(int error, object ob, mixed arg, int plural)
{
    debug_message("parser_error_message: " + sprintf("error=%d,ob=%O,arg=%O,plural=%d", error, ob, arg, plural));
    switch (error)
    {
    case ERR_NOT_LIVING:
        return arg + "不是生物。\n";
        break;

    default:
        return arg;
        break;
    }
}

object *parse_command_users()
{
    // debug_message("parse_command_users");
    return users();
}

string parse_command_all_word()
{
    debug_message("parse_command_all_word");
    return "all";
}

string *parse_command_id_list()
{
    debug_message("parse_command_id_list");
    return ({"one", "thing"});
}

string *parse_command_plural_id_list()
{
    debug_message("parse_command_plural_id_list");
    return ({"ones", "things", "them"});
}

string *parse_command_adjectiv_id_list()
{
    debug_message("parse_command_adjectiv_id_list");
    return ({"the", "an", "a"});
}

object parse_get_first_inventory(object ob)
{
    debug_message("parse_get_first_inventory");
    return first_inventory(ob);
}

object parse_get_next_inventory(object parent, object current)
{
    debug_message("parse_get_next_inventory");
    return next_inventory(current);
}

object parse_get_environment(object ob)
{
    debug_message("parse_get_environment");
    return environment(ob);
}
