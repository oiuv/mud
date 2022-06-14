/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-29 11:30:45
 * @LastEditTime: 2022-03-30 14:56:46
 * @LastEditors: 雪风
 * @Description: Natural Language Parser
 *  https://bbs.mud.ren
 */
#include <parser_error.h>

string *parse_command_id_list()
{
    // debug_message("parse_command_id_list");
    return ({"thing"});
}

string *parse_command_adjective_id_list()
{
    // debug_message("parse_command_adjective_id_list");
    return ({"the", "a", "an"});
}

string *parse_command_plural_id_list()
{
    // debug_message("parse_command_plural_id_list");
    return ({"things", "them", "everything"});
}

string *parse_command_prepos_list()
{
    // debug_message("parse_command_prepos_list");
    return ({"in", "on", "at", "along", "upon", "by", "under", "behind", "with", "beside", "into", "onto", "inside", "within", "from"});
}

string parse_command_all_word()
{
    // debug_message("parse_command_all_word");
    return "all";
}

object *parse_command_users()
{
    // debug_message("parse_command_users");
    return users();
}

string parser_error_message(int type, object ob, mixed arg, int flag)
{
    switch (type)
    {
    case ERR_IS_NOT:
    case ERR_NOT_LIVING:
    case ERR_NOT_ACCESSIBLE:
    case ERR_AMBIG:
    case ERR_ORDINAL:
    case ERR_ALLOCATED:
    case ERR_THERE_IS_NO:
    case ERR_BAD_MULTIPLE:
    case ERR_MANY_PATHS:
    default:
        return sprintf("parser_error_message : type = %d, ob = %O, arg = %O, flag = %d", type, ob, arg, flag);
    }
}

void parseRefresh() { parse_refresh(); }
