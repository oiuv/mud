// team.c

#include <command.h>
#include <dbase.h>
#include <origin.h>

STATIC_VAR_TAG object leader, *team;

int set_leader(object ob)
{
	if (ob == this_object())
		error("set_leader: Cannot set this_object() as leader.\n");
	leader = ob;
}

object query_leader() { return leader; }

int follow_path(string dir)
{
        reset_eval_cost();
	command("go " + dir);
}

int follow_me(object ob, string dir)
{
        object me;

        me = this_object();
	if (! living(me) || ob == me) return 0;

	if (ob == leader)
        {
                // 跟着别人走
                if (ob->query("env/no_follow") &&
                    me->query_dex() / 2 + random(me->query_dex()) < ob->query_dex())
                {
                        tell_object(me, ob->name() +
                                    "走得好快，你一疏神就跟不上了。\n");
                        return 0;
                }
		return follow_path(dir);
        } else
        if (arrayp(team) && team[0] == ob)
                // 跟着队伍的领袖行走
                return follow_path(dir);
}

int add_team_member(object ob)
{
	if (ob == this_object()) return 0;

	if (arrayp(team))
	{
		team -= ({ 0 });
		if (member_array(ob, team) == -1)
		{
			team += ({ ob });
			for (int i = sizeof(team) - 1; i >= 0; i--)
				team[i]->set_team(team);
		} else
			return 0;
	} else
	{
		team = ({ this_object(), ob });
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
}

varargs int dismiss_team(object ob)
{
	int i;

	if (! arrayp(team)) return 0;
	
	if (! ob)
	{
		team -= ({ 0 });
		if (team[0] == this_object())
		{
			for (i = 1; i < sizeof(team); i++)
				team[i]->set_team(0);
		} else
		{
			for (i = 0; i < sizeof(team); i++)
				team[i]->dismiss_team(this_object());
		}
		team = 0;
	} else
		team -= ({ ob });

	return 1;
}

object *query_team()
{
	return team;
}
