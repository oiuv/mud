// look.c

#include <ansi.h>
#include <command.h>
#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object me, mapping info)
{
        string arg;
        seteuid(getuid());

        if (mapp(info))
        {
                if (! stringp(arg = info[ARG]))
                        arg = "";
                while (sscanf(arg, " %s", arg));
                while (sscanf(arg, "%s ", arg));
                if (arg == "") arg = 0;
        } else arg = 0;
        if (! arg) arg = "look"; else arg = "look " + arg;

        // Why I calling run_command to look ?
        // Because sometime the look function may need
        // this_player() to indicate me, so ...
        me->force_me(arg);
        return 1;
}

