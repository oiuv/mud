/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-29 15:08:51
 * @LastEditTime: 2022-03-29 15:59:31
 * @LastEditors: 雪风
 * @Description: 自然语法分析指令守护进程
 *  https://bbs.mud.ren
 */
#ifndef VERB_DIR
#define VERB_DIR CORE_DIR "verbs/"
#endif

private mapping Verbs;

mapping getVerbs() { return copy(Verbs); }
mixed getVerb(string str) { return Verbs[str]; }

string getErrorMessage(string verb)
{
    if (!Verbs[verb])
        return 0;
    else
        return Verbs[verb]->getErrorMessage();
}

int getValidVerb(string verb)
{
    if (!strsrch(verb, VERB_DIR))
        return 1;
    else
        return 0;
}

protected int scheduledVerbLoad(string *cache)
{
    foreach (string verb in cache)
    {
        object ob;
        string *verb_list;
        if (ob = find_object(verb))
            destruct(ob);
        if (!catch (ob = load_object(verb)) && ob)
        {
            if (!(verb_list = ob->getVerbs()))
                verb_list = ({explode(verb, "/")[ < 1][0.. < 3]});
            else if (verb_list && ob->getSynonyms())
            {
                verb_list += ob->getSynonyms();
            }
            Verbs += expand_keys(([verb_list:verb]));
        }
    }
}

varargs void eventReloadVerbs(mixed val)
{
    string *cache, *verbs = 0;
    string verb;

    if (arrayp(val))
        verbs = filter(val, (: getValidVerb($1) :));
    else if (stringp(val))
    {
        if (strlen(val) > 2 && val[ < 2..] == ".c")
            val = val[0.. < 3];
        if (getValidVerb(val))
            verbs = ({val});
        if (!verbs)
            return;
    }
    else
    {
        string dir;
        verbs = ({});
        foreach (dir in get_dir(VERB_DIR))
        {
            dir = VERB_DIR + dir;
            if (file_size(dir) == -2)
                verbs += map(get_dir(dir + "/*.c"), (: $(dir) + "/" + $1 :));
        }
    }
    cache = ({});
    foreach (verb in verbs)
    {
        cache += ({verb});
        verbs -= ({verb});
        if (sizeof(cache) > 9 || !sizeof(verbs))
        {
            call_out("scheduledVerbLoad", 1, copy(cache));
            cache = ({});
        }
    }
    return;
}

string short()
{
    return "谓词指令精灵(VERB_D)";
}

protected void create()
{
    Verbs = ([]);
    eventReloadVerbs();
}
