#include <ansi.h>

inherit KNOWER;

void create()
{
    set_name("扫地僧", ({ "saodi seng", "saodi", "seng" }));
    set("nickname", HIC "消息灵通" NOR);
    set("gender", "男性" );
    set("class", "bonze");
    set("age", 100);
    set("shen_type", 1);
    set("str", 22);
    set("int", 18);
    set("con", 21);
    set("dex", 19);

    set("qi", 500);
    set("max_qi", 500);
    set("jing", 250);
    set("max_jing", 250);
    set("neili", 600);
    set("max_neili", 600);
    set("combat_exp", 5000);

    set_skill("force", 35);
    set_skill("dodge", 35);
    set_skill("parry", 35);

    setup();
    carry_object("/clone/cloth/c-jiasha")->wear();
}
