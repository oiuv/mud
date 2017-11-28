#include <ansi.h>
inherit NPC;

void create()
{
        set_name("教众", ({ "jiao zhong", "jiao", "zhong" }));
        set("long", "这是一个天鹰教的教众，手中挥舞着一面大旗。\n");
        set("attitude", "heroism");
        set("title", "天鹰教朱雀坛");
        set("max_qi", 800);
        set("max_jing", 800);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 50);
        set("combat_exp", 500000);

        set_skill("club", 150);
        set_skill("parry", 150);
        set_skill("dodge", 150);
        set_skill("force", 150);
        set_skill("unarmed", 150);

        setup();

        carry_object(__DIR__"obj/jiaofu")->wear();
        carry_object(__DIR__"obj/flag")->wield();
}
