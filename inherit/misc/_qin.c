// qin.c ÇÙ

int play_qin(string arg)
{
        string my_id;
        if (arg && sscanf(arg, "%s with %s", arg, my_id) == 2 &&
            ! this_object()->id(my_id))
                return 0;
        return SKILL_D("tanqin-jifa")->play(this_player(), this_object(), arg);
}

int valid_as_qin() { return 1; }
