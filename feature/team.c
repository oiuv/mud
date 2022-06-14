// team.c
inherit CORE_TEAM;

int follow_me(object ob, string dir)
{
    object me;

    me = this_object();
    if (!living(me) || ob == me)
        return 0;

    if (ob == leader)
    {
        // 跟着别人走
        if (ob->query("env/no_follow") &&
            me->query_dex() / 2 + random(me->query_dex()) < ob->query_dex())
        {
            tell_object(me, ob->name() + "走得好快，你一疏神就跟不上了。\n");
            return 0;
        }
        return follow_path(dir);
    }
    else if (arrayp(team) && team[0] == ob)
        // 跟着队伍的领袖行走
        return follow_path(dir);
}
