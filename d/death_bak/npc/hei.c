#include <ansi.h>
#include <command.h>
#include <login.h>

inherit NPC;

string *death_msg = ({
	HIW "黑无常说道：喂！新来的，你叫什么名字？\n\n" NOR,
	HIW "黑无常用奇异的眼光盯著你，好像要看穿你的一切似的。\n\n" NOR,
	HIW "黑无常「哼」的一声，从袖中掏出一本像帐册的东西翻看著。\n\n" NOR,
	HIW "黑无常合上册子，说道：咦？阳寿未尽？怎么可能？\n\n" NOR,
	HIW "黑无常搔了搔头，叹道：罢了罢了，你走吧。\n\n"
		"一股阴冷的浓雾突然出现，很快地包围了你。\n\n" NOR,
});

void create()
{
	set_name("黑无常", ({ "hei wuchang", "hei", "wuchang" }));
	set("title", HIR "冥府地藏王殿前" NOR);
	set("long", "\n黑无常瞪著你，焦黄的脸上看不出任何喜怒哀乐。\n");
	set("attitude", "peaceful");
	set("chat_chance", 15);
	set("chat_msg", ({
		CYN "黑无常嘿嘿干笑数声：你可终于落到我的手里了……\n" NOR,
		CYN "黑无常东张西望，不知道在打什么主意。\n" NOR,
	}) );
	set("age", 217);

        set("max_qi", 9999);
        set("max_jing", 9999);
        set("neili", 9999);
        set("max_neili", 9999);
        set("jiali", 250);

        set("combat_exp", 50000000);

        set_skill("unarmed", 500);
        set_skill("sword", 500);
        set_skill("blade", 500);
        set_skill("staff", 500);
        set_skill("hammer", 500);
        set_skill("club", 500);
        set_skill("whip", 500);
        set_skill("dagger", 500);
        set_skill("throwing", 500);
        set_skill("parry", 500);
        set_skill("dodge", 500);
        set_skill("force", 500);
        set_skill("never-defeated", 1000);
        set_skill("magic", 1000);

        map_skill("sword", "never-defeated");
        map_skill("blade", "never-defeated");
        map_skill("staff", "never-defeated");
        map_skill("hammer", "never-defeated");
        map_skill("club", "never-defeated");
        map_skill("whip", "never-defeated");
        map_skill("dagger", "never-defeated");
        map_skill("parry", "never-defeated");
        map_skill("dodge", "never-defeated");
        map_skill("force", "never-defeated");

        setup();

        carry_object(__DIR__"obj/cloth1")->wear();
        carry_object(__DIR__"obj/suolian")->wield();
        set_temp("handing", carry_object(__DIR__"obj/bi"));
}

void init()
{
	::init();
	if (! previous_object() ||
	    ! userp(previous_object()) ||
	    ! previous_object()->is_ghost() ||
	    wizardp(previous_object())) return;
	call_out("death_stage", 5, previous_object(), 0);
}

void death_stage(object ob, int stage)
{
	int i;
	object *inv, mailbox;
	if (! ob || ! present(ob)) return;

	tell_object(ob, death_msg[stage]);
	if (++stage < sizeof(death_msg))
	{
		call_out( "death_stage", 5, ob, stage );
		return;
	} else
		ob->reincarnate();

        if (! wizardp(ob))
        {
    	        inv = all_inventory(ob);
    	        for (i = 0; i < sizeof(inv); i++)
    		        DROP_CMD->do_drop(ob, inv[i]);
        }
	
	ob->move(REVIVE_ROOM);
        ob->set("startroom", REVIVE_ROOM);
	message("vision", HIW "你忽然发现前面多了一个人影，不过那人影又好像已经在那里\n"
		          "很久了，只是你一直没发觉。\n" NOR, environment(ob), ob);
}
