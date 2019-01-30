// #pragma optimize
// #pragma save_binary

inherit F_DBASE;

#include <ansi.h>

int clean_up() { return 1; }

void protect();

void create()
{
        seteuid(ROOT_UID);
        set("channel_id", "守护精灵");
        CHANNEL_D->do_channel( this_object(), "sys", "守护精灵已经启动。");
        call_out("protect", 180);
}

void protect()
{
        object *obs;
        mapping total;


        return;


        total = QUEST_D->query("information");
        if (! mapp(total))
        {

                remove_call_out("protect");
                call_out("protect", 180);

                __DIR__"memoryd"->auto_relaim();

                return;
                
        }

        obs = keys(total);
        obs = filter_array(obs, (: objectp($1) :));

        if (! sizeof(obs) || sizeof(obs) < 20)
        {

                remove_call_out("protect");
                call_out("protect", 180);

                __DIR__"memoryd"->auto_relaim();
                
                return;
        }

        remove_call_out("protect");
        call_out("protect", 180 + random(20));
}
