inherit NPC;
#include <ansi.h>

void create()
{
        set_name("菜园管事", ({ "caiyuan guanshi", "guanshi" }) );
        set("gender", "男性" );
        set("age", 50);
        set("long", "他是菜园管事，专管菜园里大小杂事！\n");
        set("combat_exp", 2500);
        set("attitude", "friendly");
        set("inquiry", ([
        	"浇水" : "你就在这老老实实给我浇水，没有我的满意，你别想回去覆命！",
        ]) );
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
        if (! ob || environment(ob) != environment()) return;
         
        if (ob->query_temp("job_name") != "浇菜地") return;

        if (! (present("shui piao", ob)))
        {
        	command("hmm " + ob->query("id"));
        	command("say 你还没领工具吧，去东物品房找武爷要了再来。\n");
        	return;
        }

        if (! (ob->query_temp("job_name") != "浇菜地"))   
        {
        	command("nod " + ob->query("id"));
                command("say 是耶律大爷吩咐你来的吧？那你就在这浇水(" HIY
                        "jiao shui" NOR + CYN ")好了。\n" NOR);
        }
}
