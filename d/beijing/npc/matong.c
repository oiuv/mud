#include <ansi.h>

#include "matongdl.h"
#include "matongem.h"
#include "matongfs.h"
#include "matongfz.h"
#include "matonghz.h"
#include "matongsz.h"
#include "matongxy.h"
#include "matongyd.h"
#include "matongyl.h"
#include "matongyz.h"

inherit NPC;

int do_ride();
string give_mashao();

void create()
{
        set_name("马童", ({ "ma tong", "matong", "ma", "tong" }));
        set("gender", "男性");
        set("age", 12);
        set("long", "镇远镖局的小童都是自小就打好了武功根底，个个手下都有点功夫。\n");
        set("str", 24);
        set("dex", 16);
        set("combat_exp", 50000);
        set("shen_type", 1);

        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_skill("parry", 60);
        set_skill("force", 60);
        set_temp("apply/attack", 40);
        set_temp("apply/defense", 40);
        set_temp("apply/armor", 30);
        set("chat_chance",2);

        //todo 防止马匹过多，可以考虑领马哨加一个cd限制。
        set("inquiry", ([
                "马哨" : (: give_mashao :),
        ]));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        :: init();
        if (interactive(ob = this_player()) && ! is_fighting() && !ob->query_temp("is_riding"))
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
        add_action("do_rideyz", "rideyz");
        add_action("do_ridesz", "ridesz");
        add_action("do_ridehz", "ridehz");
        add_action("do_ridefz", "ridefz");
        add_action("do_ridedl", "ridedl");
        add_action("do_rideyd", "rideyd");
        add_action("do_rideyl", "rideyl");
        add_action("do_ridefs", "ridefs");
        add_action("do_rideem", "rideem");
        add_action("do_ridexy", "ridexy");
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment() ) return;
        say (CYN "马童笑嘻嘻地对你说道：“怎么，又要骑马出去办事吗？”\n" NOR);
}

int accept_object(object who, object ob)
{
        //object myenv ;
        if (ob->query("money_id"))
        {
                message_vision(CYN "马童摇头道：“府上有规定，凡是镖局内的骑"
                               "马都不给钱，不是镖局的给钱也不行”。\n" NOR,
                               who);
                return 0;
        }
        else
                message_vision(CYN "马童皱眉道：“这东西还是你自个儿留着吧。"
                               "”\n" NOR, who);
        return 1;
}

void receive_damage(string type, int n)
{
        return;
}

void receive_wound(string type, int n)
{
        return;
}

string give_mashao()
{
	object	ob	= this_object();
	object	me	= this_player();
	object	obj;
	if ( me->query( "family/family_name" ) != "八卦门" )
		return("哼，你又不是我们镇远镖局的人。");
	if ( present( "ma shao", me ) )
		return("你已经有马哨了，要那么多干什么？");
	obj = new( "/clone/misc/mashao" );
	obj->move( me );
	message_vision( HIY "$N" HIY "拿出一个马哨给$n。\n" NOR, ob, me );
	return("需要马时吹(whistle)一下就行了。");
}
