//lingfeixue.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("凌飞雪", ({ "ling feixue", "feixue", "ling" }) );
        set("gender", "女性" );
	set("title",HIY "千金一笑" NOR);
        set("age", 23);
        set("long", 
        "凌飞雪原是一个青楼名妓，后来被当朝一位大官看中，据说这个\n群玉楼也是那位官员给她开的。");
        set("str", 40);
        set("dex", 40);
        set("con", 40);
        set("int", 40);
        set("per", 40);
        set("shen_type", -1);
        set_skill("unarmed", 50);
	set_skill("force", 50);
        set_skill("dodge", 50);
        set("combat_exp", 25000);
        set("max_qi", 300);
        set("max_jing", 300);
        set("qi", 300);
        set("jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("attitude", "friendly");
        set("inquiry", ([
        "name" : "我就是曾经“一笑博千金”的长安第一美女凌飞雪。",
        "here" : "这儿就是长安城里最最有名的群玉楼。",
        ]) );

        setup();
        set("chat_chance", 15);
        set("chat_msg", ({
        	"凌飞雪得意地说道：当初我妩媚一笑，也不知有多少人曾经拜倒在我裙下。\n",
        	"凌飞雪若有所思的道：也不知到湘湘今天肯不肯出来接客。\n",
        	"凌飞雪对你说道：这位客官，你来我们群玉楼就算对了，您想要什么样的姑娘都有。\n",
        }) );

        carry_object(__DIR__"obj/skirt")->wear();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && !is_fighting()) 
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
	}
}

void greeting(object me)
{
        if (! objectp(me) || environment(me) != environment())
                return;

        command("look " + me->query("id"));

        if (me->query("class") == "bonze")
	{
                command("say 呵！" + RANK_D->query_respect(me) +
                        "也来光顾我们群玉楼啊。");
                command("say 快请上楼吧！");
	}

        if (me->query("gender") == "女性")
	{
                command("say 哎呀，这位" + RANK_D->query_respect(me) +
                        "也来逛窑子，成何体同。");
                command("sigh");
	}
        command("say 楼上的姑娘们，有客人来了！");
        return ;
}

void accept_kill(object me)
{       
        object ob;
        if (is_fighting()) return;
	if (query("called")) return;
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
                       "找死吗？\n\n"NOR, me);
        ob->kill_ob(me);
	ob->set_leader(me);
        me->kill_ob(ob);
        set("called", 1);
        call_out("regenerate", 200);
}

int regenerate()
{
	set("called", 0);
	return 1;
}
