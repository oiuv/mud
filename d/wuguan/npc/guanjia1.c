inherit NPC;
#include <ansi.h>

void create()
{
        set_name("柴房管事", ({ "chaifang guanshi", "guanshi" }) );
        set("gender", "男性" );
        set("age", 50);
        set("long", "他是柴房管事，专管柴房！\n");
        set("combat_exp", 2500);
        set("attitude", "friendly");
        set("inquiry", ([
             	"劈柴" : "你就在这老老实实劈柴，我不满意，你就别想回去覆命！",
               
        ]) );
        setup();
        carry_object("/clone/misc/cloth")->wear();
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
        if (! ob || environment(ob) != environment()) return;
         
        if (ob->query_temp("job_name") != "劈柴") return;

        if (! (present("chai dao", ob)))
        {
        	command("hmm " + ob->query("id"));
        	command("say 你还没领工具吧，去东物品房找武爷要了再来。\n");
        	return;
        }

        if (! (ob->query_temp("job_name") != "劈柴"))   
        {
        	command("nod " + ob->query("id"));
                command("say 是耶律大爷吩咐你来的吧？那你就在这劈柴(" HIY
                        "pi chai" NOR + CYN ")好了。\n" NOR);
        }
}
