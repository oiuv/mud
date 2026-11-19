// team.c
inherit CORE_TEAM;

void dismiss_martial_array() {
    if (this_object()->query_temp("array/name") == "fanliangyi-dao")
        "/kungfu/skill/fanliangyi-dao"->dismiss_array(this_object());
}

int set_team(object *members) {
    if (arrayp(team) && (!arrayp(members) || sizeof(team) != sizeof(members) ||
        sizeof(team - members) || sizeof(members - team) ||
        (sizeof(team) && team[0] != members[0])))
        dismiss_martial_array();
    return ::set_team(members);
}

varargs int dismiss_team(object member) {
    if (arrayp(team) && (!member || member_array(member, team) != -1))
        dismiss_martial_array();
    return ::dismiss_team(member);
}

int follow_me(object ob, string dir) {
    object me;

    me = this_object();
    if (!living(me) || ob == me)
        return 0;

    if (ob == leader) {
        // 跟着别人走
        if (ob->query("env/no_follow") &&
            me->query_dex() / 2 + random(me->query_dex()) < ob->query_dex()) {
            tell_object(me, ob->name() + "走得好快，你一疏神就跟不上了。\n");
            return 0;
        }
        return follow_path(dir);
    } else if (arrayp(team) && team[0] == ob)
        // 跟着队伍的领袖行走
        return follow_path(dir);
}
