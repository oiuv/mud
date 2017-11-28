// gargoyle.c

#include <ansi.h>
#include <command.h>
#include <login.h>

inherit NPC;

string *death_msg = ({
	HIW "白无常说道：喂！新来的，你叫什么名字？\n\n" NOR,
	HIW "白无常用奇异的眼光盯著你，好像要看穿你的一切似的。\n\n" NOR,
	HIW "白无常「哼」的一声，从袖中掏出一本像帐册的东西翻看著。\n\n" NOR,
	HIW "白无常翻了半天，有些困惑。\n\n" NOR,
	HIW "白无常仔细看了看你，没有说什么。\n\n" NOR,
	HIW "白无常又翻了一会儿帐册，考虑了半天。\n\n" NOR,
	HIW "白无常打量了一会儿你，皱了皱眉头。\n\n" NOR,
	HIW "白无常叹了一口气。\n\n" NOR,
	HIW "白无常合上册子，想了一会儿。\n\n" NOR,
        HIW "白无常说道：你阳寿未尽？有些奇怪。\n\n" NOR,
        HIW "白无常接着说道：让你留在阴间不合时宜，让我想想。\n\n" NOR,
	HIW "白无常搔了搔头，叹道：罢了罢了，你走吧。\n\n"
            "一股阴冷的浓雾突然出现，很快地包围了你。\n\n" NOR,
});

void create()
{
	set_name("白无常", ({ "white gargoyle", "gargoyle" }));
	set("title", "冥府地藏王殿前");
	set("long",
		"白无常瞪著你，死白的脸上看不出任何喜怒哀乐。\n");
	set("attitude", "peaceful");
	set("chat_chance", 1);
	set("chat_msg", ({
		"白无常无聊的打了个哈欠。\n",
		"白无常嘿嘿奸笑两声。\n",
	}));
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
	    wizardp(previous_object())) return;
	call_out("death_stage", 30, previous_object(), 0);
}

void death_stage(object ob, int stage)
{
	int i;
	object *inv, mailbox;
	if (! ob || ! present(ob)) return;

	tell_object(ob, death_msg[stage]);
	if (++stage < sizeof(death_msg))
	{
		call_out("death_stage", 10, ob, stage);
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
