// room.c
// Updated by Doing for optimize
// The apply/long & short has been canceled

// #pragma save_binary

#include <dbase.h>
#include <room.h>
#include <config.h>

// THe switch of optimize
#define ENABLE_OPTIMIZE 1

inherit CORE_ROOM;
inherit F_DBASE;
inherit F_CLEAN_UP;

#if ENABLE_OPTIMIZE
nosave string s_long;
nosave string s_short;
nosave mixed s_fight;
#endif

int query_max_encumbrance()
{
    return 100000000000;
}

void reset()
{
    mapping ob_list, ob;
    string *list;
    int i, j;
    mapping guards;
    object *obs;

    // remove the action done in this room
    delete_temp("been");
    if ((guards = query_temp("guarded")) &&
        !sizeof(guards))
    {
        delete_temp("guarded");
    }

    // clear object
    obs = all_inventory();
    if (sizeof(obs) > MAX_ITEM_IN_ROOM)
    {
        // too much objects
        if (arrayp(query_temp("objects")))
            obs -= query_temp("objects");
        obs = filter_array(obs, (: clonep($1) && !$1->is_character() :));
        if (sizeof(obs) > MAX_ITEM_IN_ROOM)
        {
            obs = obs[MAX_ITEM_IN_ROOM..< 1];
            foreach (ob in obs)
                destruct(ob);
            if (query("outdoors"))
                message("vision", "一阵风吹过，卷走了一些东西。\n", this_object());
            else
                message("vision", "突然叮叮咣咣一阵响声过后，好像少了点什么似的。\n", this_object());
        }
    }

    //
    // Check loaded objects to match the objects specified in "objects"
    // while query("objects") is
    // ([ <object filename>: <amount>, ..... ])
    // and query_temp("objects") is
    // ([ <object filename>: ({ob1, ob2, ...}), .... ])
    //
    set("no_clean_up", 0);
    ob_list = query("objects");
    if (!mapp(ob_list))
        return;

    if (!mapp(ob = query_temp("objects")))
        ob = allocate_mapping(sizeof(ob_list));
    list = keys(ob_list);
    for (i = 0; i < sizeof(list); i++)
    {
        // Allocate an array if we have multiple same object specified.
        if (undefinedp(ob[list[i]]) &&
            intp(ob_list[list[i]]) &&
            ob_list[list[i]] > 1)
            ob[list[i]] = allocate(ob_list[list[i]]);

        switch (ob_list[list[i]])
        {
        case 1:
            if (!ob[list[i]])
                ob[list[i]] = make_inventory(list[i]);
            if (environment(ob[list[i]]) != this_object() &&
                ob[list[i]]->is_character())
            {
                if (!ob[list[i]]->return_home(this_object()))
                    add("no_clean_up", 1);
            }
            break;
        default:
            for (j = 0; j < ob_list[list[i]]; j++)
            {
                // If the object is gone, make another one.
                if (!objectp(ob[list[i]][j]))
                {
                    ob[list[i]][j] = make_inventory(list[i]);
                    continue;
                }
                // Try to call the wandering npc come back here.
                if (environment(ob[list[i]][j]) != this_object() &&
                    ob[list[i]][j]->is_character())
                {
                    if (!ob[list[i]][j]->return_home(this_object()))
                        add("no_clean_up", 1);
                }
            }
        }
    }
    set_temp("objects", ob);
}

void setup()
{
    if (query("chat_room"))
        set("no_fight", 1);
    if (query("no_fight"))
    {
        set("no_steal", 1);
        set("no_beg", 1);
    }

    seteuid(getuid());
    this_object()->reset();
}

#if ENABLE_OPTIMIZE
mixed set(mixed idx, mixed data)
{
    switch (idx)
    {
    case "short":
        return s_short = data;
    case "long":
        return s_long = data;
    case "no_fight":
        return s_fight = data;
    default:
        return ::set(idx, data);
    }
}

varargs mixed query(mixed idx, int raw)
{
    switch (idx)
    {
    case "short":
        return s_short;
    case "long":
        return s_long;
    case "no_fight":
        return s_fight;
    default:
        return ::query(idx, raw);
    }
}

void delete(mixed idx)
{
    switch (idx)
    {
    case "short":
        s_short = 0;
        break;
    case "long":
        s_long = 0;
        break;
    case "no_fight":
        s_fight = 0;
        break;
    default:
        ::delete (idx);
        break;
    }
}

string short()
{
    return s_short;
}

string long()
{
    return s_long;
}
#else
string short()
{
    if (stringp(query("apply/short")))
        return query("apply/short");

    return query("short");
}

string long()
{
    if (stringp(query("apply/long")))
        return query("apply/long");

    return query("long");
}
#endif
