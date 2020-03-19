#include <ansi.h>
inherit NPC;

void create()
{
    set_name("太湖豪杰", ({"hao jie", "hao", "jie"}));
    set("gender", "男性");
    set("age", 25);
    set("long", "这是归云庄属下的在太湖劫富济贫的太湖豪杰。\n");
    set("combat_exp", 100000);
    set_skill("dodge", 50);
    set_skill("lingxu-bu", 50);
    set_skill("unarmed", 50);
    set_skill("parry", 50);
    set_skill("changquan", 50);
    map_skill("unarmed", "changquan");
    map_skill("parry", "changquan");
    map_skill("dodge", "lingxu-bu");
    setup();

    carry_object("/clone/misc/cloth")->wear();
}
