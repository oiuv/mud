// dao-ke.c
#include <ansi.h>
inherit NPC;
void create()
{
    set_name("刀客", ({ "dao ke","ke"}) );
    set("gender", "男性");
    set("age", 20);
    set("long",
        "这家伙满脸横肉，一付凶神恶煞的模样，令人望而生畏。\n");
    set("combat_exp", 15000);
        set("shen_type", -1);
    set("attitude", "heroism");
    set_skill("unarmed", 45);
    set_skill("blade", 45);
    set_skill("parry", 40);
    set_skill("dodge", 40);
    setup();
        carry_object("/d/city/obj/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();
    add_money("silver", 10);
}
