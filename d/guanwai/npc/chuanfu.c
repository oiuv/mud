// chuanfu.c 船夫

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("船夫", ({ "chuan fu", "fu" }));
        set("gender", "男性");
        set("age", 36);
        set("long", "这是一个松花江上的船夫。饱经风霜的脸上"
                    "透出东北人的豪爽。\n");

        set("combat_exp", 10000);
        set("shen_type", 1);

	set("eff_qi",800);
	set("qi", 800);
        set("max_neili", 100);
        set("neili", 100);
        set("jiali", 10);

        setup();
	carry_object("/clone/misc/cloth")->wear();
}

int accept_object(object who, object ob)
{
//      object myenv;
        object *obs;

        if (ob->query("money_id") && ob->value() >= 100)
        {
                message_vision("船夫对$N说：好！既然这位" + RANK_D->query_respect(who) +
                               "要过江，\n那我就送你上这条船吧！\n" , who);
                message_vision("船夫让大家上了船，一声「起锚」船就张帆离岸了......\n", who);
                obs = all_inventory(environment());
                obs = filter_array(obs, (: $1 == $(who) || $1->is_character() &&
                                           $1->query_leader() == $(who) :));
                obs->move("/d/guanwai/songhuajiang");
                message("vision", BLU "你在江上一路漂流.......\n" NOR, obs);
                call_out("goto_songhua", 10, obs);
                destruct(ob);
       	        return -1;
        } else  
        {
	        message_vision("船夫皱眉对$N说：就这点？怎么也得一两银子吧！\n", who);
	        return 0;
        }
}

void goto_songhua(object *obs)
{
        obs -= ({ 0 });
        message("vision", "\n船很快停靠彼岸。你抬脚跨出船来。\n\n", obs);
        obs->move("/d/guanwai/damenkan");
}

void unconcious()
{
        ::die();
}