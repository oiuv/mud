// jinlin.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("金临", ({ "jinlin", "jin" }) );
	set("gender", "男性" );
	set("age", 18);
	set("long", "这是一位垂髫童子，是鲁班手下五行童子之一。\n");
        set("title", HIC "南方丙丁" NOR CYN "◎" HIR "火" NOR);
        set("nickname", HIY "五行童子" NOR);
	set("attitude", "friendly");
	setup();
}

int accept_object(object who, object ob)
{
        command("say 边儿去！东西不要给我。");
	return 0;
}

int accept_ask(object who, string topic)
{
        message_vision("$N半答不理的说：有啥事问我师傅去，别烦我。\n",
                       this_object());
        return 1;
}
