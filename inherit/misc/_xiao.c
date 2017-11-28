// xiao.c уп

int play_xiao(string arg)
{
        string my_id;
        if (arg && sscanf(arg, "%s with %s", arg, my_id) == 2 &&
            ! this_object()->id(my_id))
                return 0;
        return SKILL_D("chuixiao-jifa")->play(this_player(), this_object(), arg);
}

int valid_as_xiao() { return 1; }
