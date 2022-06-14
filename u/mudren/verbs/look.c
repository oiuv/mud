#include <ansi.h>
inherit __DIR__ "verb";

void create()
{
    verb::create();
    parse_refresh();
    setVerb("lk");
    setSynonyms("see");
    setRules("", "STR", "OBJ", "at LIV", "on OBJ", "in OBJ", "inside OBJ", "at OBJ on OBJ", "at STR on OBJ");
    setErrorMessage("Look at or in something?");
    setHelp("Syntax: <look>\n"
            "        <look at ITEM>\n"
            "        <look in CONTAINER>\n"
            "        <look at ITEM in CONTAINER>\n"
            "        <look at ITEM on ITEM>\n\n"
            "Without any arguments, this command allows you to look a "
            "description of the area about you, including what other "
            "things are there with you.\n\n"
            "If you look at something, then you get a detailed description "
            "of the thing at which you are looking.  You should be able to "
            "look at any thing you look mentioned in the room when you use the "
            "look command without arguments.  Anything you cannot look at is "
            "considered a bug.\n\n"
            "See also: peer");
}

mixed can_lk()
{
    return 1;
}

mixed do_lk()
{
    tell_object(this_player(), HIC "你看了看四周！\n" NOR);

    return 1;
}

mixed can_lk_at_liv()
{
    return 1;
}

mixed direct_lk_at_liv(object liv, string arg)
{
    debug_message("direct_lk_at_liv : " + sprintf("%O %s", liv, arg));
    return 1;
}

mixed do_lk_at_liv(object liv, string arg)
{
    debug_message("do_lk_at_liv : " + sprintf("%O %s", liv, arg));
    tell_object(this_player(), liv->short() + "\n");
    return 1;
}

mixed can_lk_on_obj(string verb, string word)
{
    return 1;
}

mixed direct_lk_on_obj(object obj, string arg)
{
    debug_message("direct_lk_on_obj : " + sprintf("%O %s", obj, arg));
    return 1;
}

mixed do_lk_on_obj(object obj, string arg)
{
    debug_message("do_lk_on_obj : " + sprintf("%O %s", obj, arg));
    tell_object(this_player(), obj->short() + "\n");
    return 1;
}
