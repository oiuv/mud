/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: team.c
Description: 游戏组队功能接口
Author: xuefeng
Version: v1.0
*****************************************************************************/
nosave object leader, *team;

void clean_up_team();

int set_leader(object ob)
{
    if (objectp(ob) && ob == this_object())
    {
        debug_message("set_leader: Can't set " + this_object() + " as leader.\n");
        return 0;
    }
    leader = ob;

    return 1;
}

object query_leader() { return leader; }

int follow_path(string dir)
{
    reset_eval_cost();
    return command("go " + dir);
}

int follow_me(object ob, string dir)
{
    object me;

    me = this_object();
    if (!living(me) || ob == me)
        return 0;

    if (ob == leader)
    {
        return follow_path(dir);
    }
    else if (arrayp(team) && team[0] == ob)
        // 跟着队伍的领袖行走
        return follow_path(dir);
}

int add_team_member(object ob)
{
    if (ob == this_object())
        return 0;

    if (arrayp(team))
    {
        team -= ({0});
        if (member_array(ob, team) == -1)
        {
            team += ({ob});
            for (int i = sizeof(team) - 1; i >= 0; i--)
                team[i]->set_team(team);
        }
        else
            return 0;
    }
    else
    {
        team = ({this_object(), ob});
        ob->set_team(team);
    }
    return 1;
}

int is_team_leader()
{
    return arrayp(team) && team[0] == this_object();
}

int set_team(object *t)
{
    team = t;
    return 1;
}

varargs int dismiss_team(object ob)
{
    int i;

    if (!arrayp(team))
        return 0;

    if (!ob)
    {
        team -= ({0});
        // 解散队伍
        if (team[0] == this_object())
        {
            for (i = 1; i < sizeof(team); i++)
                team[i]->set_team(0);
        }
        else
        {
            for (i = 0; i < sizeof(team); i++)
                team[i]->dismiss_team(this_object());
        }
        team = 0;
    }
    else
        team -= ({ob});

    return 1;
}

object *query_team()
{
    clean_up_team();
    return team;
}

// 清理队伍中的离线玩家
void clean_up_team()
{
    if (arrayp(team))
        team -= ({0});
}
