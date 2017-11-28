// sheep.c

inherit NPC;

void create()
{
    set_name("野羊", ({ "sheep" }) );
    set("gender", "雄性");
    set("race", "野兽");
    set("age", 2);
    set("long",
        "这只野羊在低头吃草，见了人也不惊避。\n");
    set("combat_exp", 5000);
    set("shen_type", -1);
    set("attitude", "peaceful");
    set("limbs", ({ "羊角", "前蹄", "后蹄" }) );
    set("verbs", ({ "hoof" }) );

    set("water", 200);
    set("food", 200);

    set("apply/attack", 10);
    set("apply/defense", 10);

    setup();
}
