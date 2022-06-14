/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: emote_d.c
Description: 动作表情守护进程 EMOTE_D
Author: xuefeng
Version: v1.0
Date: 2019-03-12
History:
*****************************************************************************/
#include <ansi.h>

inherit CORE_SAVE;

#define MSG_MYSELF  0
#define MSG_OTHERS  1

mapping emote;
int     set_emote(string pattern, mapping def);
string *query_emote(string pattern);

void create()
{
    if (! restore() && ! mapp(emote)){
        emote = ([ ]);
    }
}

string short()
{
    return "表情精灵(EMOTE_D)";
}

void remove()
{
    save();
}

string query_save_file() { return DATA_DIR + "emote_d"; }

varargs int do_emote(object me, string verb, string arg, object *obs, string channel)
{
    string str, *def;
    object target;

    if (! environment(me))
        return 0;

    if (! arrayp(def = query_emote(verb)))
        return 0;

    if (stringp(arg) && arg != "")
    {
        target = present(arg, environment(me));

        if (! objectp(target) || ! target->is_character())
        {
            target = find_player(arg);
            if (! objectp(target)){
                return notify_fail("你要对谁做这个动作？\n");
            }
        }

        if (target == me)
        {
            target = 0;
        }
    }

    if (!arrayp(obs)) obs = all_inventory(environment(me));
    if (!stringp(channel)) channel = YEL "%s" NOR;

    if (objectp(target) && stringp(str = def[MSG_OTHERS]))
    {
        boardcast("emote", sprintf(channel, str), me, target, obs);
    }
    else if (stringp(str = def[MSG_MYSELF]))
        boardcast("emote", sprintf(channel, str), me, 0, obs);
    else
        return notify_fail("…………\n");

    return 1;
}

int set_emote(string pattern, string *def)
{
    if(sizeof(def) != 2)
        return 0;

    emote[pattern] = def;
    save();
    return 1;
}

int delete_emote(string pattern)
{
    map_delete(emote, pattern);
    save();
    return 1;
}

string *query_emote(string pattern)
{
    string *data;

    if (undefinedp(data = emote[pattern]) || !arrayp(data) || sizeof(data) != 2)
        return 0;

    return data;
}

string *query_all_emote()
{
    return keys(emote);
}
