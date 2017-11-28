// noclone.c

int is_no_clone() { return 1; }

object check_clone()
{
        object me;

        me = this_object();
        if (clonep(me))
        {
                destruct(me);
                return 0;
        }

        if (! stringp(me->query("startroom")))
                return this_object();

        me->move(me->query("startroom"));
        if (me->is_character())
        {
                message("vision", me->name() + "走了过来。\n",
                        environment(me));
        }
        return this_object();
}
