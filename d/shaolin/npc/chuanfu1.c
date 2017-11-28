// Npc: /d/shaolin/npc/chuanfu1.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("船夫", ({ "chuan fu", }));
	set("long", "这是常年在汉水专门管货运的一位船夫。\n");

	set("gender", "男性");
	set("attitude", "peaceful");
	set("class", "bonze");

        set("age", 42);

        set("inquiry", ([
                "摆渡" : "不论货多货少，一船十两纹银，不二价。",
                "过河" : "不论货多货少，一船十两纹银，不二价。",
        ]));

	setup();
}

int accept_object(object who, object ob)
{
        object *obs;

        obs = filter_array(all_inventory(environment(who)),
                           (: $1->query_temp("owner") == $(who) :));

        if (sizeof(filter_array(obs, (: ! $1->is_character() :))) < 1)
        {
                message_vision("船夫哼了一声对$N道：“看清楚了，我这儿"
                               "只管货运，没有货你添什么乱？”\n", who);
                return 0;
        }

    	if (ob->query("money_id") && ob->value() >= 1000)
	{
        	message_vision("船夫掂了掂" + ob->name() + "，对$N说：好！这就上船吧！\n" , who);
        	message_vision("船夫叫来几个年轻船夫，帮$N将货拖上船，一声「起锚」船就开走了。\n", who);
        	who->move("/d/shaolin/hanshuim");
                if (sizeof(obs)) obs->move("/d/shaolin/hanshuim");
        	tell_object(who, HIG "你悠闲的站在船头，晃晃悠悠的过了汉水......\n" NOR);
		who->start_call_out((: call_other, __FILE__, "goto_peer", who, obs :), 10);
                destruct(ob);
		return -1;
	} else  
		message_vision("船夫白了$N一眼说：“这点钱？算了吧！”\n", who);

	return 0;
}

void goto_peer(object ob, object *obs)
{
        if (arrayp(obs) && sizeof(obs))
        {
                obs -= ({ 0 });
                if (sizeof(obs))
                        obs->move("/d/shaolin/hanshui2");
        }

	if (! objectp(ob) || environment(ob) != find_object("/d/shaolin/hanshuim"))
		return;

   	tell_object(ob, "船终于到了对岸。你走下船来，船上的活计将你的货都拉了下来。\n");
   	ob->move("/d/shaolin/hanshui2");
}

void unconcious()
{
        ::die();
}
