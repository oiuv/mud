// gargoyle.c

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
	set_name("黑无常", ({ "black gargoyle", "gargoyle" }));
	set("title", "冥府地藏王殿前");
	set("long",
		"黑无常瞪著你，焦黄的脸上看不出任何喜怒哀乐。\n");
	set("attitude", "peaceful");
	set("chat_chance", 15);
	set("chat_msg", ({
		"黑无常嘿嘿干笑数声：你可终于落到我的手里了...\n",
		"黑无常东张西望，不知道在打什么主意。\n",
	}) );
	set("age", 217);
	set("combat_exp", 20000);
	set("max_jing", 900);
	set("max_qi", 900);
	set_skill("dodge", 40);
	set_skill("unarmed", 40);
	setup();
}

void init()
{
	::init();
	if (! previous_object() ||
	    ! userp(previous_object()) ||
	    ! previous_object()->is_ghost() ||
	    ! wizardp(previous_object())) return;
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
	message("vision",
		"你忽然发现前面多了一个人影，不过那人影又好像已经在那里\n"
		"很久了，只是你一直没发觉。\n", environment(ob), ob);
}
