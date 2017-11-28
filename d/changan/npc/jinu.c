//jinu.c

inherit NPC;

#include <ansi.h>
#include "bajiao.h"

void create()
{
	set_name("¼ËÅ®", ({ "ji nu" }) );
	set("gender", "Å®ĞÔ" );
	set("age", 25);
	set("str", 10);
	set("per", 30);
	set("combat_exp", 10);
	set("attitude", "friendly");

	setup();
}

