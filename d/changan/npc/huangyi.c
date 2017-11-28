//huangyi.c

inherit NPC;

#include <ansi.h>

void create()
{
	set_name(HIY "黄衣" NOR, ({ "huang yi" }) );
	set("title", CYN "群玉八娇" NOR);
	set("gender", "女性" );
	set("age", 22);
	set("str", 30);
	set("per", 40);
	set("long", @LONG
一个全身上下穿着黄装，领露酥胸的美女．
LONG
        );
	set("combat_exp", 10);
	set("attitude", "friendly");
	setup();
        set("chat_chance", 15);
        set("chat_msg", ({
        	"黄衣说道：我说湘湘妹子，你就从了吧！干我们这行有什么不好的，吃好的，穿好的，要什么有什么！\n",
        	"黄衣叹道：唉！已经劝了这丫头三天了，我这张嘴都磨破了，她就是不出去接客！\n",
        	"黄衣对湘湘说道：你就乖乖儿的听我的话吧！别指望有谁会来救你出去了！\n",
        }) );

        setup();
	carry_object(__DIR__"obj/skirt")->wear();
}

int accept_fight(object me)
{
	command("say 小女子哪里是您的对手？");
	return 0;
}

int accept_kill(object me)
{       
        object ob;
        if (is_fighting()) return 1;
	if (query("called")) return 1;
        command("say 要杀人了，快来人救命啊！");
        ob = present("bao biao");
        if (! ob)
        {
                seteuid(getuid());
                ob=new(__DIR__"baobiao");
                ob->move(environment());
	}
	message_vision(HIC "\n忽然从门外冲进来几个保镖，对$N"
                       HIC "大喊一声“干什么？在这儿闹事，想"
                       "找死吗？\n\n" NOR, me);
        ob->kill_ob(me);
	ob->set_leader(me);
        me->kill_ob(ob);
        set("called", 1);
        call_out("regenerate", 200);
        return 0;
}

int regenerate()
{
	set("called", 0);
	return 1;
}
