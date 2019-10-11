// override efun:exec
int exec(object target, object from)
{
        if (! from || ! target)
                return 0;

        if (! previous_object()) return 0;

        if (! is_root(previous_object()))
        {
                log_file("static/security",
                         sprintf("%s  %s(%s) want to exec (%s)%s to (%s)%s on %s.\n",
                                 ctime(time()),
                                 (string)base_name(previous_object()),
                                 (this_player(1) ? geteuid(this_player(1)) : "???"),
                                 (string)from->name(),
                                 (string)geteuid(from),
                                 (string)target->name(),
                                 (string)geteuid(target),
                                 ctime(time())));
                return 0;
        }

        from->remove_interactive();
        return efun::exec(target, from);
}

// override efun:snoop
varargs object snoop(object me, object ob)
{
        if (! previous_object()) return 0;

        if (! is_root(previous_object()))
        {
                log_file("static/security",
                         sprintf("%s  %s(%s) want to snoop %s with %s.\n",
                                 ctime(time()),
                                 (string)base_name(previous_object()),
                                 (this_player(1) ? geteuid(this_player(1)) : "???"),
                                 ob ? (string)geteuid(ob) : "null",
                                 (string)geteuid(me)));
                return 0;
        }

        if (! objectp(ob))
                return efun::snoop(me);
        else
                return efun::snoop(me, ob);
}

// override efun:query_snooping
object query_snooping(object ob)
{
        if (! previous_object()) return 0;

        if (! is_root(previous_object()))
        {
                log_file("static/security",
                         sprintf("%s  %s(%s) want to query_snooping of %s.\n",
                                 ctime(time()),
                                 (string)base_name(previous_object()),
                                 (this_player(1) ? geteuid(this_player(1)) : "???"),
                                 (string)geteuid(ob)));
                return 0;
        }

        return efun::query_snooping(ob);
}

// override efun:query_snoop
object query_snoop(object ob)
{
        if (! previous_object()) return 0;

        if (! is_root(previous_object()))
        {
                log_file("static/security",
                         sprintf("%s  %s(%s) want to query_snoop of %s.\n",
                                 ctime(time()),
                                 (string)base_name(previous_object()),
                                 (this_player(1) ? geteuid(this_player(1)) : "???"),
                                 (string)geteuid(ob)));
                return 0;
        }

        return efun::query_snoop(ob);
}

// override efun:shutdown
void shutdown(int how)
{
        if (! previous_object()) return;

        if (! is_root(previous_object()))
        {
                log_file("static/security",
                         sprintf("%s  %s(%s) want to shutdown mud.\n",
                                 ctime(time()),
                                 (string)base_name(previous_object()),
                                 (this_player(1) ? geteuid(this_player(1)) : "???")));
                return 0;
        }

        return efun::shutdown(how);
}
