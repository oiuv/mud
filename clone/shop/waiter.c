#include <ansi.h>
inherit WAITER;

void create()
{
        set_name("店铺伙计", ({ "huo ji", "huo", "ji" }));
        set("long", "他就是这家店铺的伙计。\n");
        set("gender", "男性");
        set("age", random(10) + 20);

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}
