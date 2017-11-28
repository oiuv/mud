#include <ansi.h>;
inherit NPC;

void create()
{
        set_name("维吾尔少女", ({ "shao nv", "shao", "nv" }) );
        set("gender", "女性" );
        set("age", 19);
        set("long", "这位小姑娘一边忙里忙外，还和客人有说有笑。\n");
        set("combat_exp", 100);
        set("attitude", "friendly");
        set("rank_info/respect", "小姑娘");
        setup();
}

void init()
{       
        object ob;

        ::init();
        if (interactive(ob = this_player()) && ! is_fighting())
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment() ) return;
        switch(random(2))
	{
        case 0:
                say(CYN "维吾尔少女说道：这位" + RANK_D->query_respect(ob) +
                    CYN "，进来喝杯奶茶，歇歇腿吧。\n" NOR);
                break;
        case 1:
                say(CYN "维吾尔少女说道：这位" + RANK_D->query_respect(ob) +
                    CYN "，快请进来。\n" NOR);
                break;
        }
}

int accept_object(object who, object ob)
{
        
        if (ob->query("money_id") && ob->value() >= 5000) 
        {
                tell_object(who, CYN "维吾尔少女忙说道：多谢您啦！请上楼歇息吧。\n" NOR);

                who->set_temp("rent_paid",1);

                return 1;
        }
        return 0;
}
