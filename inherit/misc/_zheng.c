// zheng.c óÝ

int play_zheng(string arg)
{
        string my_id;
        if (arg && sscanf(arg, "%s with %s", arg, my_id) == 2 &&
            ! this_object()->id(my_id))
                return 0;
        return SKILL_D("guzheng-jifa")->play(this_player(), this_object(), arg);
}

int valid_as_zheng() { return 1; }
