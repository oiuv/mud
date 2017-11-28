#include <ansi.h>
inherit NPC;

void create()
{
        set_name(GRN "大青蛙" NOR, ({ "frog" }));
        set("age", 7);
        set("long", GRN "这是一只黑丝大青蛙，长在深不见日的水潭\n"
                    "里，全身恶臭，肥肥壮壮，一对血红的眼睛\n十分"
                    "恶心，你真想杀了它。\n");
        set("limbs", ({ "蛙前爪", "蛙后抓", "蛙嘴" }) );
        set("verbs", ({ "bite", "claw" }) );
        set("combat_exp", 50);
        set("shen_type", -1);
        set("str", 11);
        set("dex", 11);
        set("con", 11);
        set("int", 11);
        set("attitude", "peaceful");
        setup();
}
