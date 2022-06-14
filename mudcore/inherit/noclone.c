// noclone.c

int is_no_clone() { return 1; }

object check_clone()
{
    object me = this_object();

    if (clonep(me))
    {
        destruct(me);
        return 0;
    }

    if (!stringp(me->query("startroom")))
        return this_object();

    me->move(me->query("startroom"));
    if (me->is_character())
    {
        message("info", me->name() + "走了过来。", environment(me), me);
    }
    return this_object();
}
