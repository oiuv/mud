// Npc: /d/shaolin/npc/saodi-seng.c
// Date: YZC 96/01/19

inherit NPC;

void my_move();


void create()
{
	set_name("扫地僧", ({
		"saodi seng",
		"saodi",
		"seng",
	}));
	set("long",
		"这是一位专职负责塔楼清埽工作的寺内杂役僧人。\n"
	);


	set("gender", "男性");
	set("attitude", "peaceful");
	set("class", "bonze");

	set("chat_msg",({

	(: this_object(), "my_move" :),
	"扫地僧喃喃自语：这几天也真怪，干干净净的，不知道打哪冒出许多老鼠来！\n",

	}));

	set("age", 35);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 300);
	set("max_jing", 150);
	set("neili", 100);
	set("max_neili", 100);
	set("combat_exp", 5000);
	set("score", 100);
	set("chat_chance", 5);

	set_skill("force", 25);
	set_skill("dodge", 25);
	set_skill("unarmed", 25);
	set_skill("parry", 25);


	setup();

}


void my_move()
{
	int value;
	
	value = random(10);
	
	if (value > 6)
	{
		command("say 还一大堆活没干完呢，我得赶紧了。\n");
		command("sigh");
		command("up");
	}
	else if (value < 4)
	{
		command("say 还一大堆活没干完呢，我得赶紧了。\n");
		command("sigh");
		command("down");
	}
}

