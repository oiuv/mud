// wang.c

inherit NPC;
#include <ansi.h>;
int ask_me();

void create()
{
        set_name("王小二", ({ "wang xiaoer", "wang" }) );
        set("gender", "男性" );
        set("age", 21);
        set("long", "这是个典型的关西汉子，一脸彪悍之色。\n");
	set_skill("unarmed", 40);
	set_skill("dodge", 40);
        set("combat_exp", 5000);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);

	set("shen_type", -1);
        set("str", 28);
        set("dex", 25);
        set("con", 20);
        set("int", 17);
        set("book_count", 1);
        set("attitude","heroism");
        set("inquiry", ([
		"王小二" : "那就是我啊...",
		"鸡" : (: ask_me :),
		"偷鸡" : (: ask_me :),
        ]) );
        setup();
        add_money("silver", 10);
}
void init()
{
        ::init();
        add_action("do_bihua", "bihua");
}

int ask_me()
{
	if ((int)this_player()->query_temp("marks/王3"))
	{
		say(
"王小二眼露凶光，对" + this_player()->name() + "喊道：杀人不过头点地，我已经\n"
"服了软，你还不放过我，老子跟你拼了!\n");
		set_temp("apply/attack", 30);
     		set_temp("apply/defense", 30);
		this_object()->kill_ob(this_player());
		return 1;
	} else
	{
	say(
"王小二看了" + this_player()->name() + "一眼，满不在乎的说道：\n"
"不错，鸡是我偷的，你要怎麽样！看你也是出来闯江湖的，难道\n" 
"不知江湖上谁的拳头大谁说话？你不服气？那好，咱俩练几招，\n"
"要是你赢了，我马上按双倍价赔给老太太。而且我还另外送你点\n"
"东西。你要输了，就给我爬着出去。怎麽着，敢不敢比划(bihua)几下？\n");
		this_player()->set_temp("marks/王2", 1);
		return 1;
	}
}

int do_bihua()
{
	object me, obj, book;
	int current_qi;

	me = this_object();
	obj = this_player();
	if (query("book_count") < 1)
	{
		write("王小二冲着" + obj->name() +
		      "白了白眼：老子没空，你快给我滚蛋，别搅大爷的清梦。\n");
		return 1;
	}
	add("book_count", -1);
	book = new("/clone/book/sword_book");
	current_qi = (int)me->query("qi");

	say(obj->name() + "对王小二说：好吧，那" +
	    RANK_D->query_self_rude(obj) + "就同你练几招。\n");
        if (obj->query_temp("marks/王2"))
	{
                obj->set_temp("marks/王2", 0);
		while ((obj->query("qi") * 100 / obj->query("max_qi")) > 50)
		{
			if (! present(obj, environment()))
				return 1;
                        COMBAT_D->do_attack(obj, me, query_temp("weapon"));
			if (((int)me->query("qi")*100/(current_qi+1))< 50)
			{
				say("王小二对" + obj->name() +
				    "说道：今儿您赢了我，您说什么我都得听着，"
			            "我这就把\n钱给老太太送去。另外，这本书也"
				    "是您的了。这是前些日子华山派从这\n路过，"
				    "在庙里歇脚时落下的。\n"
				);
      				book->move(obj);
      				add("book_count", -1);
				obj->set_temp("marks/王3", 1);
			        message_vision("$N交给$n一本书。\n", me, obj);
				return 1;
			}
	                COMBAT_D->do_attack(me, obj);
		}
		say("王小二冲着" + obj->name() +
		    "撇了撇嘴，说道：就你这点本事还来\n"
		    "充英雄？给我乖乖的爬出去吧！\n"
		);
                message("vision", obj->name() + "乖乖的趴在地上，从洞里爬了"
			"出去。\n", environment(obj), ({obj}) );
                obj->move("/d/village/temple1");
                message("vision", obj->name() + "从洞里爬了出来。\n",
		        environment(obj), ({obj}) );
                return 1;
	}
	say("王小二不耐烦的对" + obj->name() +
	    "说道：要打就动手，罗嗦什么！\n");
	return 1;
}

