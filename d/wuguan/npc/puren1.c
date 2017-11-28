inherit NPC;
#include <ansi.h>

void create()
{
        set_name("仆人", ({ "pu ren", "puren","ren" }) );
        set("gender", "男性" );
        set("age", 25);
        set("int", 28);
        set("long", "这是个仆人打扮的年青人，两眼乱转，四处看个不停。\n");
        set("attitude", "peaceful");
        set("combat_exp",10000 + random(5000));
        set("chat_chance", 1);
        set("chat_msg", ({
        	CYN "仆人突然说道：后院很需要人手，郭大侠正为此烦恼呢。\n" NOR,
        	CYN "仆役低声的说：在后院做事有好多好处啊。\n" NOR,
        }));
        setup();
        carry_object("/clone/misc/cloth")->wear();
}
