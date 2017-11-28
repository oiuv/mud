// Copyright (C) 2003, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.
// lingshe 西域灵蛇

#include <ansi.h>
inherit SNAKE;

void create()
{
        set_name("灵蛇", ({ "ling she", "she", "snake" }) );
        set("race", "野兽");
        set("age", 4);
        set("long", "一条银光闪闪的小蛇，产于西域，极为罕见。\n");
        set("attitude", "peaceful");

        set("msg_fail", "$n冲$N嘶地一吐舌头");
        set("msg_succ", "$n嘶嘶做响，蛇头随着$N的手动了起来");
        set("msg_trained","$n悄无声息地游到$N的脚下不动了");
        set("auto_follow",0);
        set("wildness", 90);

        set("str", 30);
        set("con", 30);
	set("dex", 35);

        set("combat_exp", 100000);

        set_temp("apply/attack", 55);
        set_temp("apply/damage", 56);
        set_temp("apply/armor", 52);

        setup();
}


void init()
{
        object ob;
        ::init();
	add_action("convert","bian");
        if (interactive(ob = this_player()) &&
	    ob->query("family/family_name") != "欧阳世家" &&
                ! present("xiong huang", environment(ob))) {
                        remove_call_out("kill_ob");
                        call_out("kill_ob", 1, ob); 
        }
}

void unconcious()
{	
	write("灵蛇嗦地一下逃掉了。\n");
	destruct(this_object());
}
void die()
{
        object ob;
        ob = new("/d/baituo/npc/obj/shedan");
        ob->move(environment(this_object()));
        destruct(this_object());
}
/*
mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
	victim->apply_condition("bt_poison", 10 + me->query("snake_poison") +
		victim->query_condition("bt_poison"));
	if (me->query("bite_busy")) victim->start_busy(2);
}
*/

int convert(string arg)
{
	object me = this_player();
	object ob;

	if (arg != "ling she") return 0;
        if (me->query("family/family_name") != "欧阳世家") 
		return notify_fail("你不能化蛇为杖。\n");
	if (me->query_skill("training",1) < 70 + random(70)) {
		kill_ob(me);
		return 1;
	}
	message_vision("$N左手按住灵蛇的头，右手轻抚其七寸，口中念念有词，片刻间将蛇化为一根蛇杖。\n",
		me,);
	        ob = new("/d/baituo/obj/lingshezhang");
        ob->move(environment(this_object()));
	ob->set("poison_applied", me->query_skill("poison",1)/2);
        destruct(this_object());
        return 1;    
}
